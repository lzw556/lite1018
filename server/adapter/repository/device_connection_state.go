package repository

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"go.etcd.io/bbolt"
)

type DeviceConnectionState struct {
	repository
}

func (repo DeviceConnectionState) Create(mac string, e *entity.DeviceConnectionState) error {
	return repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists([]byte(e.BucketName()))
		if err != nil {
			return err
		}
		bytes, err := json.Marshal(e)
		if err != nil {
			return err
		}
		return bucket.Put([]byte(mac), bytes)
	})
}

func (repo DeviceConnectionState) Get(mac string) (*entity.DeviceConnectionState, error) {
	var e entity.DeviceConnectionState
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		if bucket == nil {
			return nil
		}
		bytes := bucket.Get([]byte(mac))
		if bytes == nil {
			return nil
		}
		return json.Unmarshal(bytes, &e)
	})
	return &e, err
}

func (repo DeviceConnectionState) Delete(mac string) error {
	return repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(entity.DeviceConnectionState{}.BucketName()))
		if bucket == nil {
			return nil
		}
		return bucket.Delete([]byte(mac))
	})
}

func (repo DeviceConnectionState) Update(mac string, e *entity.DeviceConnectionState) error {
	return repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists([]byte(e.BucketName()))
		if err != nil {
			return err
		}
		bytes, err := json.Marshal(e)
		if err != nil {
			return err
		}
		return bucket.Put([]byte(mac), bytes)
	})
}
