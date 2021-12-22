package measurement

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"time"
)

type Strategy interface {
	Do(m po.Measurement) (po.MeasurementData, error)
}

func inPeriod(last time.Time, period time.Duration) bool {
	return time.Now().Sub(last).Seconds() <= period.Seconds()
}
