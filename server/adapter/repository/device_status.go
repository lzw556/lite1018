package repository

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"go.etcd.io/bbolt"
)

type DeviceStatus struct {
	repository
}

func (repo DeviceStatus) Create(id uint, e po.DeviceStatus) error {
	return repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		buf, err := json.Marshal(e)
		if err != nil {
			return err
		}
		return bucket.Put(itob(id), buf)
	})
}

func (repo DeviceStatus) Get(id uint) (po.DeviceStatus, error) {
	var e po.DeviceStatus
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		if bytes := bucket.Get(itob(id)); bytes != nil {
			return json.Unmarshal(bytes, &e)
		}
		return nil
	})
	return e, err
}

func (repo DeviceStatus) Delete(id uint) error {
	err := repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(po.DeviceStatus{}.BucketName()))
		return bucket.Delete(itob(id))
	})
	return err
}
