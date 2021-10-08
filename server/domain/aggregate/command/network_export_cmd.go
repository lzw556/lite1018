package command

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type NetworkExportCmd struct {
	entity.Network

	Devices []entity.Device
}

func NewNetworkExportCmd() NetworkExportCmd {
	return NetworkExportCmd{}
}

func (cmd NetworkExportCmd) Run() *vo.NetworkExportFile {
	n := vo.NewNetworkExportFile(cmd.Network)
	n.AddDevices(cmd.Devices)
	return &n
}
