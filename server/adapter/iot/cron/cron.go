package cron

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/global"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/task"
)

func Start() {
	if global.DB != nil {
		var networkRepo = repository.Network{}
		networks, _ := networkRepo.Find(context.TODO())
		for _, network := range networks {
			task.AddJob(NewNetwork(network))
		}
	}
}
