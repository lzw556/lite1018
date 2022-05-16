package command

import (
	"context"
	"fmt"
	mqtt "github.com/eclipse/paho.mqtt.golang"
	uuid "github.com/satori/go.uuid"
	"github.com/thetasensors/theta-cloud-lite/server/adapter"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"time"
)

type Request interface {
	Name() string
	Response() string
	Qos() byte
	Payload() ([]byte, error)
	Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error)
}

type Response struct {
	ReqID   string `json:"req_id"`
	Code    int    `json:"code"`
	Payload []byte `json:"payload"`
}

type request struct {
	id        string
	timestamp int64
}

func newRequest() request {
	return request{
		id:        uuid.NewV1().String(),
		timestamp: time.Now().UTC().Unix(),
	}
}

func (cmd request) do(ctx context.Context, gateway string, target string, request Request, timeout time.Duration) ([]byte, error) {
	ch := make(chan []byte)
	xlog.Debugf("executing %s command => [%s]", request.Name(), target)
	payload, err := request.Payload()
	if err != nil {
		return nil, response.BusinessErr(errcode.DeviceCommandSendFailedError, err.Error())
	}
	topic := fmt.Sprintf("iot/v2/gw/%s/dev/%s", gateway, target)
	err = adapter.IoT.Subscribe(fmt.Sprintf("%s/msg/%s/", topic, request.Response()), 1, func(c mqtt.Client, msg mqtt.Message) {
		ch <- msg.Payload()
	})
	if err != nil {
		return nil, response.BusinessErr(errcode.DeviceCommandExecFailedError, err.Error())
	}
	defer func() {
		adapter.IoT.Unsubscribe(fmt.Sprintf("%s/msg/%s/", topic, request.Response()))
	}()
	if err := adapter.IoT.Publish(fmt.Sprintf("%s/cmd/%s/", topic, request.Name()), request.Qos(), payload); err != nil {
		return nil, response.BusinessErr(errcode.DeviceCommandSendFailedError, err.Error())
	}
	select {
	case payload := <-ch:
		xlog.Debugf("%s command executed successful => [%s]", request.Name(), target)
		return payload, nil
	case <-ctx.Done():
		return nil, response.BusinessErr(errcode.DeviceCommandCancelledError, "")
	case <-time.After(timeout):
		return nil, response.BusinessErr(errcode.DeviceCommandSendTimeoutError, "")
	}
}
