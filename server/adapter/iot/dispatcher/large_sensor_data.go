package dispatcher

import (
	"fmt"
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type LargeSensorData struct {
}

func NewLargeSensorData() iot.Dispatcher {
	return &LargeSensorData{}
}

func (d LargeSensorData) Name() string {
	return "largeSensorData"
}

func (d LargeSensorData) Dispatch(msg iot.Message) {
	process.Do(iot.NewContext(), process.NewLargeSensorData(), msg)

	m := pd.LargeSensorDataMessage{}
	if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
		xlog.Error("unmarshal [LargeSensorDataMessage] message failed", err)
		return
	}

	cmd := command.NewLargeSensorDataAckCommand(m.SessionId, m.SegmentId)
	topic := fmt.Sprintf("iot/v2/gw/%s/dev/%s/cmd/%s/", msg.Body.Gateway, msg.Body.Device, cmd.Name())
	payload, err := cmd.Payload()
	if err != nil {
		xlog.Errorf("generate [%s] command payload failed: %v => %s", d.Name(), err, msg.Body.Device)
		return
	}
	adapter.IoT.Publish(topic, 1, payload)
}
