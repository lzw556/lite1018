package command

import (
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type LoadFirmwareResponse struct {
}

func NewLoadFirmwareResponse() LoadFirmwareResponse {
	return LoadFirmwareResponse{}
}

func (d LoadFirmwareResponse) Name() string {
	return "loadFirmwareResponse"
}

func (d LoadFirmwareResponse) Dispatch(msg iot.Message) {
	m := pd.FirmwareLoadStatusMessage{}
	if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
		xlog.Errorf("unmarshal [%s] message failed: %v", d.Name(), err)
		return
	}
	status := map[string]interface{}{
		"taskId":   m.TaskId,
		"seqId":    m.SeqId,
		"progress": m.Progress,
	}
	payload, err := json.Marshal(status)
	if err != nil {
		xlog.Errorf("marshal [%s] message failed: %v", d.Name(), err)
		return
	}
	if _, err := cache.Get(m.ReqId); err == nil {
		xlog.Infof("[%s] loadFirmware command executed successful req id %s", msg.Body.Device, m.ReqId)
		_ = cache.Delete(m.ReqId)
	} else {
		response := Response{
			Code:    int(m.Code),
			Payload: payload,
		}
		eventbus.Publish(m.ReqId, response)
	}
}
