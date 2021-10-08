package mqtt

import (
	"fmt"
	"github.com/mochi-co/mqtt/server"
	"github.com/mochi-co/mqtt/server/listeners"
	"github.com/thetasensors/theta-cloud-lite/server/config"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type Adapter struct {
	server *server.Server

	username string
	password string
	port     int
}

func NewAdapter(conf config.MQTT) Adapter {
	a := Adapter{
		username: conf.Username,
		password: conf.Password,
		port:     conf.Server.Port,
	}
	a.server = server.New()
	return a
}

func (a Adapter) Run() error {
	tcp := listeners.NewTCP("mqtt", fmt.Sprintf(":%d", a.port))
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

func (a Adapter) Close() {
	if err := a.server.Close(); err != nil {
		xlog.Error("shutdown mqtt server failed", err)
	}
	xlog.Info("shutdown mqtt server")
}
