package command

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"time"
)

type NetworkSyncCommand struct {
	entity.Network
	Devices entity.Devices
}

func NewNetworkSyncCommand() NetworkSyncCommand {
	return NetworkSyncCommand{}
}

func (cmd NetworkSyncCommand) Run() error {
	return command.SyncNetwork(cmd.Network, cmd.Devices, 3*time.Second)
}
