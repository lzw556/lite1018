package crontask

import "github.com/robfig/cron/v3"

type Job interface {
	ID() string
	Schedule() cron.Schedule
	Run()
}
