package repository

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"go.etcd.io/bbolt"
)

type DeviceInformation struct {
	repository
}

func (repo DeviceInformation) Create(id uint, e po.DeviceInformation) error {
	return repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		buf, err := json.Marshal(e)
		if err != nil {
			return err
		}
		return bucket.Put(itob(id), buf)
	})
}

func (repo DeviceInformation) Get(id uint) (po.DeviceInformation, error) {
	var e po.DeviceInformation
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		if bytes := bucket.Get(itob(id)); bytes != nil {
			return json.Unmarshal(bytes, &e)
		}
		return nil
	})
	return e, err
}

func (repo DeviceInformation) Delete(id uint) error {
	err := repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(po.DeviceInformation{}.BucketName()))
		return bucket.Delete(itob(id))
	})
	return err
}
