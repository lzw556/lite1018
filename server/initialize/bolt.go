package initialize

import (
	"github.com/thetasensors/theta-cloud-lite/server/core"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"go.etcd.io/bbolt"
)

func InitBuckets(db *bbolt.DB) {
	buckets := []core.Bucket{
		po.System{},
		po.DeviceStatus{},
		entity.DeviceAlertState{},
		po.DeviceData{},
		po.DeviceInformation{},
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
