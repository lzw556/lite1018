package dispatcher

import (
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type Bye struct {
}

func (Bye) Name() string {
	return "bye"
}

func (d Bye) Dispatch(msg iot.Message) {
	m := pd.ByeMessage{}
	if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
		xlog.Error("unmarshal [Bye] message failed", err)
		return
	}
}
