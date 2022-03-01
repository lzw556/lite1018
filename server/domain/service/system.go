package service

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/system"
	"github.com/thetasensors/theta-cloud-lite/server/config"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/utils"
)

type System struct {
}

func NewSystem() system.Service {
	return System{}
}

func (s System) GetSystem() (*vo.System, error) {
	var err error
	var result vo.System
	result.Server.Os = utils.InitOs()
	if result.Server.Cpu, err = utils.InitCPU(); err != nil {
		return &result, err
	}
	if result.Server.Ram, err = utils.InitRAM(); err != nil {
		return &result, err
	}
	if result.Server.Disk, err = utils.InitDisk(); err != nil {
		return &result, err
	}
	conf := config.IoT{}
	if err := config.Scan("iot", &conf); err != nil {
		return &result, err
	}
	result.MQTT.Username = conf.Username
	result.MQTT.Password = conf.Password
	result.MQTT.Address = fmt.Sprintf("%s:%d", utils.ReadLocalIPAddress(), conf.Server.Port)
	return &result, nil
}

func (s System) Reboot() error {
	return utils.Reboot()
}
