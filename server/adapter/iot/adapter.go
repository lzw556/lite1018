package iot

import (
	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/thetasensors/theta-cloud-lite/server/config"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type Adapter struct {
	client mqtt.Client

	dispatchers map[string]Dispatcher
}

func NewAdapter(conf config.MQTT) Adapter {
	opts := mqtt.NewClientOptions()
	opts.Username = conf.Username
	opts.Password = conf.Password
	opts.ClientID = "iot"
	opts.CleanSession = false
	opts.AddBroker(conf.Client.Broker)
	return Adapter{
		client:      mqtt.NewClient(opts),
		dispatchers: map[string]Dispatcher{},
	}
}

func (a *Adapter) RegisterDispatchers(dispatchers ...Dispatcher) {
	for _, dispatcher := range dispatchers {
		a.dispatchers[dispatcher.Name()] = dispatcher
	}
}

func (a Adapter) Run() error {
	loadJobs()
	if t := a.client.Connect(); t.Wait() && t.Error() != nil {
		return t.Error()
	}
	t := a.client.Subscribe("iot/v2/gw/+/dev/+/msg/+/", 2, func(client mqtt.Client, message mqtt.Message) {
		msg := parse(message)
		if dispatcher, ok := a.dispatchers[msg.Header.Type]; ok {
			xlog.Infof("receive %s message => [%s]", dispatcher.Name(), msg.Body.Device)
			go dispatcher.Dispatch(msg)
		}
	})
	if t.Wait() && t.Error() != nil {
		return t.Error()
	}
	xlog.Info("iot server start successful")
	Init(a.client)
	return nil
}

func (a Adapter) Close() {
	a.client.Disconnect(1000)
	xlog.Info("shutdown iot server")
}
