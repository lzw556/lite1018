package eventbus

import "github.com/asaskevich/EventBus"

var bus EventBus.Bus

func init() {
	bus = EventBus.New()
}

func Subscribe(topic string, handler interface{}) error {
	return bus.Subscribe(topic, handler)
}

func SubscribeOnce(topic string, handler interface{}) error {
	return bus.SubscribeOnce(topic, handler)
}

func Unsubscribe(topic string, handler interface{}) error {
	return bus.Unsubscribe(topic, handler)
}

func Publish(topic string, args ...interface{}) {
	bus.Publish(topic, args...)
}
