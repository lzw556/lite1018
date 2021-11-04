package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
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

func (cmd NetworkUpdateCmd) Update(req request.Network) (*vo.Network, error) {
	cmd.Network.CommunicationPeriod = req.CommunicationPeriod
	cmd.Network.CommunicationTimeOffset = req.CommunicationTimeOffset
	cmd.Network.GroupInterval = req.GroupInterval
	cmd.Network.GroupSize = req.GroupSize
	cmd.Network.Name = req.Name
	err := cmd.networkRepo.Save(context.TODO(), &cmd.Network.Network)
	if err != nil {
		return nil, err
	}
	go command.SyncWsnSettings(cmd.Network, cmd.Gateway, true, 3*time.Second)
	result := vo.NewNetwork(cmd.Network)
	return &result, nil
}

func (cmd NetworkUpdateCmd) UpdateSetting(req request.WSN) error {
	cmd.Network.CommunicationPeriod = req.CommunicationPeriod
	cmd.Network.CommunicationTimeOffset = req.CommunicationTimeOffset
	cmd.Network.GroupInterval = req.GroupInterval
	cmd.Network.GroupSize = req.GroupSize
	err := cmd.networkRepo.Save(context.TODO(), &cmd.Network.Network)
	if err != nil {
		return err
	}
	command.SyncWsnSettings(cmd.Network, cmd.Gateway, true, 3*time.Second)
	return nil
}
