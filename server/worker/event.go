package worker

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

var eventRepo = repository.Event{}
var EventsChan = make(chan entity.Event)

func Run() {
	for event := range EventsChan {
		_ = eventRepo.Create(context.TODO(), &event)
	}
}
