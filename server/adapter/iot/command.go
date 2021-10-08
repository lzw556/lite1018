package iot

import (
	"context"
	"errors"
	"fmt"
	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"sync"
	"time"
)

type CommandType uint

const (
	UpgradeCmdType CommandType = iota + 1
	CancelUpgradeCmdType
	ResetCmdType
	RebootCmdType
)

var (
	CommandSendTimeoutError = errors.New("command send timeout")
	CommandExecFailedError  = errors.New("command exec failed")
	UnknownCommandTypeError = errors.New("unknown command type")
)

type Command interface {
	ID() string
	Name() string
	Qos() byte
	Payload() []byte
	Response() chan pd.GeneralResponseMessage
}

type CommandResponse struct {
	ReqID string `json:"req_id"`
}

type scheduler struct {
	client       mqtt.Client
	responseChan map[string]chan CommandResponse

	networkRepo dependency.NetworkRepository
	deviceRepo  dependency.DeviceRepository
}

var s *scheduler
var once sync.Once

func Init(client mqtt.Client) {
	once.Do(func() {
		s = &scheduler{
			client:       client,
			responseChan: map[string]chan CommandResponse{},
			networkRepo:  repository.Network{},
			deviceRepo:   repository.Device{},
		}
	})
}

func (scheduler *scheduler) send(gateway string, target string, cmd Command) error {
	if !scheduler.client.IsConnected() {
		return errors.New("mqtt is disconnected")
	}
	topic := fmt.Sprintf("iot/v2/gw/%s/dev/%s/cmd/%s/", gateway, target, cmd.Name())
	token := scheduler.client.Publish(topic, cmd.Qos(), false, cmd.Payload())
	if token.Wait() && token.Error() != nil {
		return token.Error()
	}
	return nil
}

func (scheduler *scheduler) sendWithResponse(gateway string, target string, cmd Command) error {
	if err := eventbus.SubscribeOnce(eventbus.DeviceCommandResponse, func(msg pd.GeneralResponseMessage) {
		if cmd.ID() == msg.ReqId {
			cmd.Response() <- msg
		}
	}); err != nil {
		return err
	}
	return s.send(gateway, target, cmd)
}

func ExecuteCommand(gateway string, device entity.Device, t CommandType, timeout time.Duration) error {
	var cmd Command
	switch t {
	case RebootCmdType:
		cmd = command.NewRebootCmd()
	default:
		return UnknownCommandTypeError
	}
	if err := s.sendWithResponse(gateway, device.MacAddress, cmd); err != nil {
		return err
	}
	select {
	case response := <-cmd.Response():
		if response.Code == 0 {
			return nil
		}
		return CommandExecFailedError
	case <-time.After(timeout):
		return CommandSendTimeoutError
	}
}

func SyncDeviceSettings(mac string, timeout time.Duration) {
	xlog.Infof("starting sync device settings => [%s]", mac)
	ctx := context.TODO()
	device, err := s.deviceRepo.GetBySpecs(ctx, spec.DeviceMacSpec(mac))
	if err != nil {
		xlog.Errorf("device %s not found: %v", err)
		return
	}
	network, err := s.networkRepo.Get(ctx, device.NetworkID)
	if err != nil {
		xlog.Errorf("device not in network: %v", err)
		return
	}
	gateway, err := s.deviceRepo.Get(ctx, network.GatewayID)
	if err != nil {
		xlog.Errorf("gateway %s not found: %v", err)
		return
	}
	cmd := command.NewUpdateDeviceSettingsCmd(device.IPN, device.System, device.Sensors)
	if err := s.sendWithResponse(gateway.MacAddress, device.MacAddress, cmd); err != nil {
		xlog.Errorf("sync device %s settings failed: %v", device.MacAddress, err)
		return
	}
	select {
	case <-cmd.Response():
		xlog.Infof("sync device settings successful => [%s]", device.MacAddress)
		return
	case <-time.After(timeout):
		xlog.Warnf("sync device settings timeout => [%s]", device.MacAddress)
		return
	}
}

func SyncWsnSettings(network entity.Network, gateway entity.Device, isSyncWsnOnly bool, timeout time.Duration) bool {
	xlog.Infof("starting sync wsn settings => [%s]", gateway.MacAddress)
	cmd := command.NewUpdateWsnSettingsCmd(network, isSyncWsnOnly)
	if err := s.sendWithResponse(gateway.MacAddress, gateway.MacAddress, cmd); err != nil {
		xlog.Errorf("sync wsn settings failed: %v", err)
		return false
	}
	select {
	case response := <-cmd.Response():
		xlog.Infof("sync wsn settings successful => [%s]", gateway.MacAddress)
		return response.Code == 0
	case <-time.After(timeout):
		xlog.Warn("sync wsn settings timeout")
		return false
	}
}

func SyncDeviceList(gateway entity.Device, devices []entity.Device, timeout time.Duration) bool {
	xlog.Infof("starting sync device list => [%s]", gateway.MacAddress)
	cmd := command.NewUpdateDeviceListCmd(gateway, devices)
	if err := s.sendWithResponse(gateway.MacAddress, gateway.MacAddress, cmd); err != nil {
		xlog.Errorf("sync device list failed: %v", err)
		return false
	}
	select {
	case response := <-cmd.Response():
		xlog.Infof("sync device list successful => [%s]", gateway.MacAddress)
		return response.Code == 0
	case <-time.After(timeout):
		xlog.Infof("sync device list timeout => [%s]", gateway.MacAddress)
		return false
	}
}
