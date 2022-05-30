package dispatcher

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type Ping struct {
}

func NewPing() Ping {
	return Ping{}
}

func (d Ping) Name() string {
	return "ping"
}

func (d Ping) Dispatch(msg iot.Message) {
	m := pd.PingMessage{}
	if err := m.Unmarshal(msg.Body.Payload); err != nil {
		xlog.Errorf("unmarshal [%s] message failed: %v => %s", d.Name(), err, msg.Body.Device)
		return
	}
	cmd := command.NewPongCommand()
	topic := fmt.Sprintf("iot/v2/gw/%s/dev/%s/cmd/%s/", msg.Body.Gateway, msg.Body.Device, cmd.Name())
	payload, err := cmd.Payload()
	if err != nil {
		xlog.Errorf("generate [%s] command payload failed: %v => %s", d.Name(), err, msg.Body.Device)
		return
	}
	adapter.IoT.Publish(topic, 1, payload)
}
