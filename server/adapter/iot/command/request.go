package command

import (
	"fmt"
	uuid "github.com/satori/go.uuid"
	"github.com/thetasensors/theta-cloud-lite/server/adapter"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"time"
)

type Request interface {
	ID() string
	Name() string
	Response() chan Response
	Qos() byte
	Payload() ([]byte, error)
	Execute(gateway string, target string) (*Response, error)
}

type Response struct {
	Code    int    `json:"code"`
	Payload []byte `json:"payload"`
}

type request struct {
	id        string
	timestamp int64
	response  chan Response
}

func newRequest() request {
	return request{
		id:        uuid.NewV1().String(),
		timestamp: time.Now().UTC().Unix(),
		response:  make(chan Response),
	}
}

func (cmd request) do(gateway string, target string, request Request, timeout time.Duration) (*Response, error) {
	xlog.Debugf("executing %s command => [%s]", request.Name(), target)
	payload, err := request.Payload()
	if err != nil {
		return nil, response.BusinessErr(errcode.DeviceCommandSendFailedError, err.Error())
	}
	err = eventbus.SubscribeOnce(request.ID(), func(response Response) {
		request.Response() <- response
	})
	if err != nil {
		return nil, response.BusinessErr(errcode.DeviceCommandExecFailedError, err.Error())
	}
	if err := adapter.IoT.Publish(fmt.Sprintf("iot/v2/gw/%s/dev/%s/cmd/%s/", gateway, target, request.Name()), request.Qos(), payload); err != nil {
		return nil, response.BusinessErr(errcode.DeviceCommandSendFailedError, err.Error())
	}
	select {
	case resp := <-request.Response():
		xlog.Debugf("%s command executed successful => [%s]", request.Name(), target)
		return &resp, nil
	case <-time.After(timeout):
		return nil, response.BusinessErr(errcode.DeviceCommandSendTimeoutError, "")
	}
}
