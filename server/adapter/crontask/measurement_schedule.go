package crontask

import "time"

type MeasurementSchedule struct {
	Every time.Duration
	Delay time.Duration
}

func (m MeasurementSchedule) Next(t time.Time) time.Time {
	return t.Truncate(m.Every).Add(m.Delay + m.Every)
}
