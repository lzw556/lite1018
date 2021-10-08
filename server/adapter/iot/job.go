package iot

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/job"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/task"
)

var networkRepo = repository.Network{}

func loadJobs() {
	networks, _ := networkRepo.Find(context.TODO())
	for _, network := range networks {
		task.AddJob(job.NewNetwork(network))
	}
}
