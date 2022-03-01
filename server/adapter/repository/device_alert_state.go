package repository

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"go.etcd.io/bbolt"
)

type DeviceAlertState struct {
	repository
}

func (repo DeviceAlertState) Create(mac string, e entity.DeviceAlertState) error {
	return repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists([]byte(e.BucketName()))
		if err != nil {
			return err
		}
		dataBucket, err := bucket.CreateBucketIfNotExists([]byte(mac))
		bytes, err := json.Marshal(e)
		if err != nil {
			return err
		}
		return dataBucket.Put(itob(e.Rule.ID), bytes)
	})
}

func (repo DeviceAlertState) Get(mac string, id uint) (entity.DeviceAlertState, error) {
	var e entity.DeviceAlertState
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		if bucket == nil {
			return nil
		}
		dataBucket := bucket.Bucket([]byte(mac))
		if dataBucket != nil {
			if bytes := dataBucket.Get(itob(id)); bytes != nil {
				return json.Unmarshal(bytes, &e)
			}
		}
		return nil
	})
	return e, err
}

func (repo DeviceAlertState) Find(mac string) ([]entity.DeviceAlertState, error) {
	var es []entity.DeviceAlertState
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(entity.DeviceAlertState{}.BucketName()))
		if bucket == nil {
			return nil
		}
		dataBucket := bucket.Bucket([]byte(mac))
		if dataBucket != nil {
			return dataBucket.ForEach(func(k, v []byte) error {
				var e entity.DeviceAlertState
				if err := json.Unmarshal(v, &e); err != nil {
					return err
				}
				es = append(es, e)
				return nil
			})
		}
		return nil
	})
	return es, err
}

func (repo DeviceAlertState) Delete(mac string, id uint) error {
	return repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists([]byte(entity.DeviceAlertState{}.BucketName()))
		if err != nil {
			return err
		}
		dataBucket, err := bucket.CreateBucketIfNotExists([]byte(mac))
		if err != nil {
			return err
		}
		return dataBucket.Delete(itob(id))
	})
}
