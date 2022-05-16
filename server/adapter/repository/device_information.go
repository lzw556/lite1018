package repository

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"go.etcd.io/bbolt"
)

type DeviceInformation struct {
	repository
}

func (repo DeviceInformation) Create(mac string, e entity.DeviceInformation) error {
	return repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		buf, err := json.Marshal(e)
		if err != nil {
			return err
		}
		return bucket.Put([]byte(mac), buf)
	})
}

func (repo DeviceInformation) Get(mac string) (entity.DeviceInformation, error) {
	var e entity.DeviceInformation
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		if bytes := bucket.Get([]byte(mac)); bytes != nil {
			return json.Unmarshal(bytes, &e)
		}
		return nil
	})
	return e, err
}

func (repo DeviceInformation) Delete(mac string) error {
	err := repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists([]byte(entity.DeviceInformation{}.BucketName()))
		if err != nil {
			return err
		}
		return bucket.Delete([]byte(mac))
	})
	return err
}
