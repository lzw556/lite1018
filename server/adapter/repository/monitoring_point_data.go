package repository

import (
	"bytes"
	"fmt"
	"time"

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

func (repo MonitoringPointData) Find(id uint, from, to time.Time) ([]entity.MonitoringPointData, error) {
	var es []entity.MonitoringPointData

	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(entity.MonitoringPointData{}.BucketName()))
		if bucket != nil {
			if mpBucket := bucket.Bucket([]byte(fmt.Sprintf("MP%d", id))); mpBucket != nil {
				c := mpBucket.Cursor()
				min := []byte(from.UTC().Format("2006-01-02T15:04:05Z"))
				max := []byte(to.UTC().Format("2006-01-02T15:04:05Z"))
				for k, v := c.Seek(min); k != nil && bytes.Compare(k, max) <= 0; k, v = c.Next() {
					var e entity.MonitoringPointData
					if err := json.Unmarshal(v, &e); err != nil {
						return err
					}
					es = append(es, e)
				}
			}
		}
		return nil
	})
	return es, err
}
