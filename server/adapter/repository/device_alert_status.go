package repository

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"go.etcd.io/bbolt"
)

type DeviceAlertState struct {
	repository
}

func (repo DeviceAlertState) Create(id uint, e *entity.DeviceAlertState) error {
	return repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		buf, err := json.Marshal(e)
		if err != nil {
			return err
		}
		return bucket.Put(itob(id), buf)
	})
}

func (repo DeviceAlertState) Save(id uint, e *entity.DeviceAlertState) error {
	return repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		buf, err := json.Marshal(e)
		if err != nil {
			return err
		}
		return bucket.Put(itob(id), buf)
	})
}

func (repo DeviceAlertState) Get(id uint) (entity.DeviceAlertState, error) {
	var e entity.DeviceAlertState
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		if buf := bucket.Get(itob(id)); len(buf) > 0 {
			return json.Unmarshal(buf, &e)
		}
		return nil
	})
	return e, err
}

func (repo DeviceAlertState) Delete(id uint) error {
	err := repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(entity.DeviceAlertState{}.BucketName()))
		return bucket.Delete(itob(id))
	})
	return err
}
