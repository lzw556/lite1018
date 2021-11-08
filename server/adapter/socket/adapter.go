package socket

import (
	"fmt"
	"io"
	"log"
	"net/http"

	uuid "github.com/satori/go.uuid"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/socket/event"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"

	socketio "github.com/googollee/go-socket.io"
	"github.com/googollee/go-socket.io/engineio"
	"github.com/googollee/go-socket.io/engineio/transport"
	"github.com/googollee/go-socket.io/engineio/transport/websocket"
)

type Adapter struct {
	socket *socketio.Server

	events []event.Event
}

func NewAdapter() *Adapter {
	a := &Adapter{}
	a.socket = socketio.NewServer(&engineio.Options{
		Transports: []transport.Transport{
			&websocket.Transport{
				CheckOrigin: func(r *http.Request) bool {
					return true
				},
			},
		},
		SessionIDGenerator: a,
	})
	return a
}

func (a *Adapter) RegisterEvents(events ...event.Event) {
	a.events = append(a.events, events...)
}

func (a *Adapter) Run() error {
	a.socket.OnConnect("/", func(c socketio.Conn) error {
		xlog.Info(fmt.Sprintf("socket id %s connected", c.ID()))
		c.Emit("ready", fmt.Sprintf("socket connected: %s", c.ID()))
		return nil
	})

	a.socket.OnDisconnect("/", func(c socketio.Conn, s string) {
		xlog.Info(fmt.Sprintf("socket id %s disconnect", c.ID()))
		if err := c.Close(); err != nil {
			xlog.Error("socket connection close failed.", err)
		}
	})

	a.socket.OnError("/", func(c socketio.Conn, err error) {
		xlog.Error(fmt.Sprintf("socket id %s error event.", c.ID()), err)
		if err := c.Close(); err != nil {
			xlog.Error("socket close error.", err)
			return
		}
	})

	for _, e := range a.events {
		xlog.Infof("socket server on event %s", e.Name())
		a.socket.OnEvent(e.Namespace(), e.Name(), e.Handler)
	}

	if err := eventbus.Subscribe(eventbus.SocketEmit, a.emit); err != nil {
		return err
	}

	go func() {
		if err := a.socket.Serve(); err != nil && err != io.EOF {
			log.Fatalln(err)
		}
	}()
	http.Handle("/socket.io/", a.socket)
	return http.ListenAndServe(":8291", nil)
}

func (a *Adapter) emit(event string, data interface{}) {
	fmt.Println(data)
	a.socket.BroadcastToNamespace("/", event, response.SuccessResponse(data))
}

func (a *Adapter) Close() {
	xlog.Info("shutdown socket server")
	if err := a.socket.Close(); err != nil && err != io.EOF {
		xlog.Errorf("socket server close failed: %s", err.Error())
	}
}

func (a *Adapter) NewID() string {
	return uuid.NewV1().String()
}
