package background

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"sync"
)

type TaskQueue struct {
	running bool
	gateway entity.Device
	tasks   *Task

	mu sync.RWMutex
}

func NewTaskQueue(gateway entity.Device) *TaskQueue {
	return &TaskQueue{
		running: false,
		gateway: gateway,
		mu:      sync.RWMutex{},
	}
}

func (q *TaskQueue) Append(task *Task) {
	q.mu.Lock()
	if q.tasks == nil {
		q.tasks = task
	} else {
		prev := q.tasks
		for prev.next != nil {
			prev = prev.next
		}
		prev.next = task
	}
	task.Device.UpdateUpgradeState(entity.DeviceUpgradeStatusPending, 0)
	q.mu.Unlock()
}

func (q *TaskQueue) Remove(device entity.Device) {
	q.mu.Lock()
	prev := q.tasks
	found := false
	for {
		if prev.next == nil {
			break
		} else if prev.next.MacAddress == device.MacAddress {
			found = true
			break
		}
		prev.next = prev
	}
	if found {
		prev.next = prev.next.next
	}
	q.mu.Unlock()
}

func (q *TaskQueue) GetTask(device entity.Device) *Task {
	for q.tasks != nil {
		if q.tasks.MacAddress == device.MacAddress {
			return q.tasks
		}
		q.tasks = q.tasks.next
	}
	return nil
}

func (q *TaskQueue) Stop() {
	q.running = false
}

func (q *TaskQueue) Run() {
	q.running = true
	go func() {
		for q.tasks != nil && q.running {
			if err := q.tasks.Run(q.gateway); err != nil {
				xlog.Errorf("device [%s] task run failed: %v", q.tasks.MacAddress, err)
			}
			q.tasks = q.tasks.next
		}
		q.running = false
	}()
}

func (q *TaskQueue) IsRunning() bool {
	return q.running
}

var queues = map[string]*TaskQueue{}
var mu sync.RWMutex

func AddTaskQueue(gateway string, queue *TaskQueue) {
	mu.Lock()
	queues[gateway] = queue
	mu.Unlock()
}

func GetTaskQueue(gateway string) *TaskQueue {
	queue, ok := queues[gateway]
	if !ok {
		return nil
	}
	return queue
}
