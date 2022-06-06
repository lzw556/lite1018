package command

import (
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type GetWsnResponse struct {
}

func NewGetWsnResponse() GetWsnResponse {
	return GetWsnResponse{}
}

func (d GetWsnResponse) Name() string {
	return "getWsnResponse"
}

func (d GetWsnResponse) Dispatch(msg iot.Message) {
	m := pd.DeviceSettingsMessage{}
	if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
		xlog.Errorf("unmarshal [%s] message failed: %v", d.Name(), err)
		return
	}
	response := Response{
		Code:    int(m.Code),
		Payload: []byte(m.Settings),
	}
	eventbus.Publish(m.ReqId, response)
}
