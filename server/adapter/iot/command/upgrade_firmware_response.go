package command

import (
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type UpgradeFirmwareResponse struct {
}

func NewUpgradeFirmwareResponse() UpgradeFirmwareResponse {
	return UpgradeFirmwareResponse{}
}

func (d UpgradeFirmwareResponse) Name() string {
	return "upgradeFirmwareResponse"
}

func (d UpgradeFirmwareResponse) Dispatch(msg iot.Message) {
	m := pd.FirmwareUpgradeResponseMessage{}
	if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
		xlog.Errorf("unmarshal [%s] message failed: %v", d.Name(), err)
		return
	}
	if _, err := cache.Get(m.ReqId); err == nil {
		xlog.Infof("[%s] updateDevices command executed successful req id %s", msg.Body.Device, m.ReqId)
		_ = cache.Delete(m.ReqId)
	} else {
		response := Response{
			Code:    int(m.Code),
			Payload: msg.Body.Payload,
		}
		eventbus.Publish(m.ReqId, response)
	}
}
