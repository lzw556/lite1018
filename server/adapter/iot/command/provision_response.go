package command

import (
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type ProvisionResponse struct {
}

func NewProvisionResponse() ProvisionResponse {
	return ProvisionResponse{}
}

func (d ProvisionResponse) Name() string {
	return "provisionResponse"
}

func (d ProvisionResponse) Dispatch(msg iot.Message) {
	m := pd.GeneralResponseMessage{}
	if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
		xlog.Errorf("unmarshal [%s] message failed: %v", d.Name(), err)
		return
	}
	if _, err := cache.Get(m.ReqId); err == nil {
		xlog.Infof("[%s] provision command executed successful req id %s", msg.Body.Device, m.ReqId)
		_ = cache.Delete(m.ReqId)
	} else {
		response := Response{
			Code: int(m.Code),
		}
		eventbus.Publish(m.ReqId, response)
	}
}
