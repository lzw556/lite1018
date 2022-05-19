package iot

import (
	"fmt"
	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/mochi-co/mqtt/server"
	"github.com/mochi-co/mqtt/server/listeners"
	uuid "github.com/satori/go.uuid"
	"github.com/thetasensors/theta-cloud-lite/server/config"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type Adapter struct {
	client        mqtt.Client
	server        *server.Server
	username      string
	password      string
	port          int
	serverEnabled bool
	dispatchers   map[string]Dispatcher
}

func NewAdapter(conf config.IoT) *Adapter {
	a := &Adapter{
		username:      conf.Username,
		password:      conf.Password,
		port:          conf.Server.Port,
		serverEnabled: conf.Server.Enabled,
		dispatchers:   map[string]Dispatcher{},
	}
	opts := mqtt.NewClientOptions()
	opts.SetUsername(conf.Username).
		SetPassword(conf.Password).
		SetClientID(fmt.Sprintf("iot-%s", uuid.NewV1().String())).
		SetAutoReconnect(true).
		SetCleanSession(false).
		SetConnectRetry(true).
		SetOrderMatters(false).
		AddBroker(conf.Broker).
		SetOnConnectHandler(a.onConnect).
		SetConnectionLostHandler(func(client mqtt.Client, err error) {
			xlog.Errorf("connection lost to MQTT broker: %v", err)
		})
	a.client = mqtt.NewClient(opts)
	return a
}

func (a *Adapter) RegisterDispatchers(dispatchers ...Dispatcher) {
	for _, dispatcher := range dispatchers {
		a.dispatchers[dispatcher.Name()] = dispatcher
	}
}

func (a *Adapter) startMQTTServer() error {
	a.server = server.New()
	tcp := listeners.NewTCP(uuid.NewV1().String(), fmt.Sprintf(":%d", a.port))
	conf := &listeners.Config{
		Auth: Auth{
			Username: a.username,
			Password: a.password,
		},
	}
	if err := a.server.AddListener(tcp, conf); err != nil {
		return err
	}
	if err := a.server.Serve(); err != nil {
		return err
	}
	xlog.Info("mqtt server start successful")
	return nil
}

func (a *Adapter) Subscribe(topic string, qos byte, handler func(c mqtt.Client, msg mqtt.Message)) error {
	t := a.client.Subscribe(topic, qos, handler)
	if t.Wait() && t.Error() != nil {
		return t.Error()
	}
	return nil
}

func (a *Adapter) Unsubscribe(topic string) {
	a.client.Unsubscribe(topic)
}

func (a *Adapter) Publish(topic string, qos byte, payload []byte) error {
	t := a.client.Publish(topic, qos, true, payload)
	go func() {
		_ = t.Wait()
		if t.Error() != nil {
			xlog.Errorf("publish message error: %s", t.Error())
		}
	}()
	return nil
}

func (a *Adapter) onConnect(c mqtt.Client) {
	xlog.Info("connected to MQTT broker")
	t := c.Subscribe("iot/v2/gw/+/dev/+/msg/+/", 0, func(c mqtt.Client, message mqtt.Message) {
		msg := parse(message)
		if dispatcher, ok := a.dispatchers[msg.Header.Type]; ok {
			xlog.Debugf("receive %s message => [%s]", dispatcher.Name(), msg.Body.Device)
			go dispatcher.Dispatch(msg)
		}
	})
	if t.Wait() && t.Error() != nil {
		xlog.Errorf("subscribe message error: %s", t.Error())
	}
}

func (a *Adapter) Run() error {
	if a.serverEnabled {
		if err := a.startMQTTServer(); err != nil {
			return err
		}
	}
	if t := a.client.Connect(); t.Wait() && t.Error() != nil {
		return t.Error()
	}
	xlog.Info("iot server start successful")
	return nil
}

func (a *Adapter) Close() {
	a.client.Disconnect(1000)
	if a.serverEnabled {
		if err := a.server.Close(); err != nil {
			xlog.Error("shutdown mqtt server failed", err)
		}
	}
	xlog.Info("shutdown iot server")
}
