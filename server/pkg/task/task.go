package task

import (
	"github.com/robfig/cron/v3"
	"sync"
)

type adapter struct {
	cron      *cron.Cron
	entityIDs map[string]cron.EntryID

	mu sync.RWMutex
}

var task *adapter
var once sync.Once

func Init() {
	once.Do(func() {
		task = &adapter{
			cron:      cron.New(),
			entityIDs: map[string]cron.EntryID{},

			mu: sync.RWMutex{},
		}
	})
}

func AddJob(job Job) {
	if _, ok := getEntity(job.ID()); !ok {
		entityID, err := task.cron.AddJob(job.Spec(), job)
		if err != nil {
			return
		}
		setEntity(job, entityID)
	}
}

func getEntity(id string) (cron.EntryID, bool) {
	value, ok := task.entityIDs[id]
	return value, ok
}

func Run() {
	task.cron.Run()
}

func Stop() {
	task.cron.Stop()
}

func setEntity(job Job, value cron.EntryID) {
	task.mu.Lock()
	task.entityIDs[job.ID()] = value
	task.mu.Unlock()
}
