package socket

import "github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"

type Message struct {
	Room      string
	Event     string
	Namespace string
	Data      interface{}
}

func (m Message) Emit() {
	eventbus.Publish(eventbus.SocketEmit, m)
}
