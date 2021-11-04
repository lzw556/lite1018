package background

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type Task struct {
	entity.Device
	executor Executor
	next     *Task

	context context.Context
	cancel  context.CancelFunc
}

func NewTask(e entity.Device, executor Executor) *Task {
	t := &Task{
		Device:   e,
		executor: executor,
	}
	t.context, t.cancel = context.WithCancel(context.TODO())
	return t
}

func (t Task) Run(gateway entity.Device) error {
	return t.executor.Execute(t.context, gateway, t.Device)
}

func (t Task) Cancel() {
	t.cancel()
}
