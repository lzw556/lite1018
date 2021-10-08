package socket

import "github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"

func Emit(event string, data interface{}) {
	msg := Message{
		Namespace: "/",
		Event:     event,
		Data:      data,
	}
	eventbus.Publish(eventbus.SocketEmit, msg)
}
