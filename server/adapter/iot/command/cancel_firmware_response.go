package command

import (
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type CancelFirmwareResponse struct {
}

func NewCancelFirmwareResponse() CancelFirmwareResponse {
	return CancelFirmwareResponse{}
}

func (d CancelFirmwareResponse) Name() string {
	return "cancelFirmwareResponse"
}

func (d CancelFirmwareResponse) Dispatch(msg iot.Message) {
	m := pd.FirmwareCancelResponseMessage{}
	if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
		xlog.Errorf("unmarshal [%s] message failed: %v", d.Name(), err)
		return
	}
	response := Response{
		Code:    int(m.Code),
		Payload: []byte(m.TaskId),
	}
	eventbus.Publish(m.ReqId, response)
}
