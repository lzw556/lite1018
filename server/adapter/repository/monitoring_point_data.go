package repository

import (
	"fmt"

	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"go.etcd.io/bbolt"
)

type MonitoringPointData struct {
	repository
}

func (repo MonitoringPointData) Create(e entity.MonitoringPointData) error {
	return repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists([]byte(e.BucketName()))
		if err != nil {
			return err
		}
		mpBucket, err := bucket.CreateBucketIfNotExists([]byte(fmt.Sprintf("MP%d", e.MonitoringPointID)))
		if err != nil {
			return err
		}
		buf, err := json.Marshal(e)

		return mpBucket.Put([]byte(e.Time.UTC().Format("2006-01-02T15:04:05Z")), buf)
	})
}
