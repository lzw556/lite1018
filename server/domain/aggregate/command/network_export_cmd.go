package command

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"sort"
)

type NetworkExportCmd struct {
	entity.Network

	Devices entity.Devices
}

func NewNetworkExportCmd() NetworkExportCmd {
	return NetworkExportCmd{}
}

func (cmd NetworkExportCmd) Run() *vo.NetworkExportFile {
	n := vo.NewNetworkExportFile(cmd.Network)
	sort.Sort(cmd.Devices)
	n.AddDevices(cmd.Devices)
	return &n
}
