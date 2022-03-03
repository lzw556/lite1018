package dependency

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"time"
)

type SensorDataRepository interface {
	Create(e entity.SensorData) error
	Find(mac string, sensorType uint, from, to time.Time) ([]entity.SensorData, error)
	Get(mac string, sensorType uint, time time.Time) (entity.SensorData, error)
	Last(mac string, sensorType uint) (entity.SensorData, error)
	Top(mac string, limit int) ([]entity.SensorData, error)
	Delete(mac string, sensorType uint, from, to time.Time) error
	FindTimes(mac string, sensorType uint, from, to time.Time) ([]time.Time, error)
}
