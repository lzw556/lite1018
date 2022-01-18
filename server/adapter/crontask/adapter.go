package crontask

import (
	"context"
	"github.com/robfig/cron/v3"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"sync"
)

type Adapter struct {
	cron      *cron.Cron
	entityIDs map[string]cron.EntryID

	mu sync.RWMutex
}

func NewAdapter() *Adapter {
	a := &Adapter{
		cron:      cron.New(cron.WithSeconds()),
		entityIDs: make(map[string]cron.EntryID),
		mu:        sync.RWMutex{},
	}
	a.initMeasurementJobs()
	return a

}

func (a *Adapter) initMeasurementJobs() {
	repo := repository.Measurement{}
	es, err := repo.FindBySpecs(context.TODO(), spec.ModeEqSpec(po.PollingAcquisitionMode))
	if err != nil {
		xlog.Error("init measurement jobs", err)
		return
	}
	jobs := make([]Job, len(es))
	for i, e := range es {
		jobs[i] = NewMeasurementDataJob(e)
	}
	a.AddJobs(jobs...)
}

func (a *Adapter) AddJobs(jobs ...Job) {
	for _, j := range jobs {
		xlog.Infof("add job [%s] to cron task", j.ID())
		if _, ok := a.getEntity(j.ID()); !ok {
			entityID := a.cron.Schedule(j.Schedule(), j)
			a.setEntity(j, entityID)
		}
	}
}

func (a *Adapter) RemoveJob(id string) {
	a.mu.Lock()
	defer a.mu.Unlock()
	if entityID, ok := a.getEntity(id); ok {
		a.cron.Remove(entityID)
		delete(a.entityIDs, id)
	}
}

func (a *Adapter) RefreshJob(job Job) {
	a.RemoveJob(job.ID())
	a.AddJobs(job)
}

func (a *Adapter) getEntity(id string) (cron.EntryID, bool) {
	value, ok := a.entityIDs[id]
	return value, ok
}

func (a *Adapter) Run() error {
	a.cron.Run()
	return nil
}

func (a *Adapter) Stop() {
	a.cron.Stop()
}

func (a *Adapter) setEntity(job Job, value cron.EntryID) {
	a.mu.Lock()
	a.entityIDs[job.ID()] = value
	a.mu.Unlock()
}
