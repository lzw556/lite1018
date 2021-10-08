package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"time"
)

type NetworkUpdateCmd struct {
	entity.Network
	Gateway entity.Device

	networkRepo dependency.NetworkRepository
}

func NewNetworkUpdateCmd() NetworkUpdateCmd {
	return NetworkUpdateCmd{
		networkRepo: repository.Network{},
	}
}

func (cmd NetworkUpdateCmd) UpdateSetting(req request.WSN) error {
	cmd.Network.CommunicationPeriod = req.CommunicationPeriod
	cmd.Network.CommunicationTimeOffset = req.CommunicationTimeOffset
	err := cmd.networkRepo.Save(context.TODO(), &cmd.Network.Network)
	if err != nil {
		return err
	}
	iot.SyncWsnSettings(cmd.Network, cmd.Gateway, true, 3*time.Second)
	return nil
}
