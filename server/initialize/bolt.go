package initialize

import (
	"github.com/thetasensors/theta-cloud-lite/server/core"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"go.etcd.io/bbolt"
)

func InitBuckets(db *bbolt.DB) {
	buckets := []core.Bucket{
		entity.System{},
		entity.DeviceState{},
		entity.SensorData{},
		entity.LargeSensorData{},
		entity.DeviceInformation{},
	}
	_ = db.Update(func(tx *bbolt.Tx) error {
		for _, bucket := range buckets {
			if tx.Bucket([]byte(bucket.BucketName())) == nil {
				if _, err := tx.CreateBucket([]byte(bucket.BucketName())); err != nil {
					panic(err)
				}
			}
		}
		return nil
	})
}
