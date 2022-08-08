package command

import (
	"fmt"
	uuid "github.com/satori/go.uuid"
	"github.com/thetasensors/theta-cloud-lite/server/adapter"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
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
	Execute(gateway string, target string, retained bool) (*Response, error)
	AsyncExecute(gateway string, target string, retained bool) error
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

func (cmd request) doAsync(gateway string, target string, request Request, retained bool, timeout time.Duration) error {
	xlog.Debugf("async executing %s command => [%s]", request.Name(), target)
	payload, err := request.Payload()
	if err != nil {
		return response.BusinessErr(errcode.DeviceCommandSendFailedError, err.Error())
	}
	topic := fmt.Sprintf("iot/v2/gw/%s/dev/%s/cmd/%s/", gateway, target, request.Name())
	adapter.IoT.Publish(topic, request.Qos(), retained, payload)
	if err = cache.Set(request.ID(), []byte(target)); err != nil {
		xlog.Errorf("[%s] cache [%s] command send failed: %v", request.Name(), err)
	} else {
		xlog.Infof("[%s] send [%s] command successful req id [%s]", target, request.Name(), request.ID())
	}
	return nil
}

func (cmd request) do(gateway string, target string, request Request, retained bool, timeout time.Duration) (*Response, error) {
	xlog.Debugf("executing %s command => [%s]", request.Name(), target)
	payload, err := request.Payload()
	if err != nil {
		return nil, response.BusinessErr(errcode.DeviceCommandSendFailedError, err.Error())
	}
	topic := fmt.Sprintf("iot/v2/gw/%s/dev/%s/cmd/%s/", gateway, target, request.Name())
	// publish mqtt with response
	err = eventbus.SubscribeOnce(request.ID(), func(response Response) {
		xlog.Debugf("received response from %s command => [%s]", request.Name(), target)
		request.Response() <- response
	})
	if err != nil {
		return nil, response.BusinessErr(errcode.DeviceCommandExecFailedError, err.Error())
	}
	xlog.Debugf("publishing %s command => [%s]", request.Name(), target)
	adapter.IoT.Publish(topic, request.Qos(), retained, payload)
	xlog.Debugf("published %s command => [%s]", request.Name(), target)
	select {
	case <-time.After(timeout * time.Second):
		return nil, response.BusinessErr(errcode.DeviceCommandSendTimeoutError, "")
	default:
		xlog.Debugf("waiting for response from %s command => [%s]", request.Name(), target)
		resp := <-request.Response()
		return &resp, nil
	}
}
