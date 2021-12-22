package repository

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"go.etcd.io/bbolt"
)

type MeasurementAlert struct {
	repository
}

func (repo MeasurementAlert) Create(e *entity.MeasurementAlert) error {
	return repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists([]byte(e.BucketName()))
		if err != nil {
			return err
		}
		buf, err := json.Marshal(e)
		if err != nil {
			return err
		}
		return bucket.Put(itob(e.ID), buf)
	})
}

func (repo MeasurementAlert) Get(id uint) (entity.MeasurementAlert, error) {
	var e entity.MeasurementAlert
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		buf := bucket.Get(itob(id))
		fmt.Println(string(buf))
		if len(buf) > 0 {
			if err := json.Unmarshal(buf, &e); err != nil {
				return err
			}
		}
		return nil
	})
	fmt.Println(err)
	return e, err
}
