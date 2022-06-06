package command

import (
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type GetLinkStatesResponse struct {
}

func NewGetLinkStatesResponse() GetLinkStatesResponse {
	return GetLinkStatesResponse{}
}

func (d GetLinkStatesResponse) Name() string {
	return "getLinkStatesResponse"
}

func (d GetLinkStatesResponse) Dispatch(msg iot.Message) {
	m := pd.LinkStatesMessage{}
	if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
		xlog.Errorf("unmarshal [%s] message failed: %v", d.Name(), err)
		return
	}
	response := Response{
		Code:    int(m.Code),
		Payload: []byte(m.States),
	}
	eventbus.Publish(m.ReqId, response)
}
