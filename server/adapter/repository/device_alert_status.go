package repository

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"go.etcd.io/bbolt"
)

type DeviceAlertStatus struct {
	repository
}

func (repo DeviceAlertStatus) Create(id uint, e *po.DeviceAlertStatus) error {
	return repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		buf, err := json.Marshal(e)
		if err != nil {
			return err
		}
		return bucket.Put(itob(id), buf)
	})
}

func (repo DeviceAlertStatus) Get(id uint) (po.DeviceAlertStatus, error) {
	var e po.DeviceAlertStatus
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		return json.Unmarshal(bucket.Get(itob(id)), &e)
	})
	return e, err
}

func (repo DeviceAlertStatus) Delete(id uint) error {
	err := repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(po.DeviceAlertStatus{}.BucketName()))
		return bucket.Delete(itob(id))
	})
	return err
}
