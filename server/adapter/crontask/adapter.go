package crontask

import (
	"github.com/robfig/cron/v3"
	"sync"
)

type Adapter struct {
	cron      *cron.Cron
	entityIDs map[string]cron.EntryID

	mu sync.RWMutex
}

func NewAdapter() *Adapter {
	return &Adapter{
		cron:      cron.New(),
		entityIDs: map[string]cron.EntryID{},
		mu:        sync.RWMutex{},
	}
}

func (a *Adapter) AddJobs(jobs ...Job) {
	for _, job := range jobs {
		if _, ok := a.getEntity(job.ID()); !ok {
			entityID, err := a.cron.AddJob(job.Spec(), job)
			if err != nil {
				return
			}
			a.setEntity(job, entityID)
		}
	}
}

func (a *Adapter) RemoveJob(id string) {

}

func (a *Adapter) getEntity(id string) (cron.EntryID, bool) {
	value, ok := a.entityIDs[id]
	return value, ok
}

func (a *Adapter) Run() {
	a.cron.Run()
}

func (a *Adapter) Stop() {
	a.cron.Stop()
}

func (a *Adapter) setEntity(job Job, value cron.EntryID) {
	a.mu.Lock()
	a.entityIDs[job.ID()] = value
	a.mu.Unlock()
}
