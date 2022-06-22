package repository

import (
	"fmt"

	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"go.etcd.io/bbolt"
)

type MonitoringPointAlertState struct {
	repository
}

func (repo MonitoringPointAlertState) Create(mpId uint, e entity.MonitoringPointAlertState) error {
	return repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists([]byte(e.BucketName()))
		if err != nil {
			return err
		}
		dataBucket, err := bucket.CreateBucketIfNotExists([]byte(fmt.Sprintf("MP%d", mpId)))
		if err != nil {
			return err
		}

		bytes, err := json.Marshal(e)
		if err != nil {
			return err
		}
		return dataBucket.Put(itob(e.Rule.ID), bytes)
	})
}

func (repo MonitoringPointAlertState) Get(mpId uint, id uint) (entity.MonitoringPointAlertState, error) {
	var e entity.MonitoringPointAlertState
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		if bucket == nil {
			return nil
		}
		dataBucket := bucket.Bucket([]byte(fmt.Sprintf("MP%d", mpId)))
		if dataBucket != nil {
			if bytes := dataBucket.Get(itob(id)); bytes != nil {
				return json.Unmarshal(bytes, &e)
			}
		}
		return nil
	})
	return e, err
}

func (repo MonitoringPointAlertState) Find(mpId uint) ([]entity.MonitoringPointAlertState, error) {
	var es []entity.MonitoringPointAlertState
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(entity.MonitoringPointAlertState{}.BucketName()))
		if bucket == nil {
			return nil
		}
		dataBucket := bucket.Bucket([]byte(fmt.Sprintf("MP%d", mpId)))
		if dataBucket != nil {
			return dataBucket.ForEach(func(k, v []byte) error {
				var e entity.MonitoringPointAlertState
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

func (repo MonitoringPointAlertState) Delete(mpId uint, id uint) error {
	return repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists([]byte(entity.MonitoringPointAlertState{}.BucketName()))
		if err != nil {
			return err
		}
		dataBucket, err := bucket.CreateBucketIfNotExists([]byte(fmt.Sprintf("MP%d", mpId)))
		if err != nil {
			return err
		}
		return dataBucket.Delete(itob(id))
	})
}

func (repo MonitoringPointAlertState) DeleteAll(mpId uint) error {
	return repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists([]byte(entity.MonitoringPointAlertState{}.BucketName()))
		if err != nil {
			return err
		}
		if err = bucket.DeleteBucket([]byte(fmt.Sprintf("MP%d", mpId))); err != nil && err.Error() != "bucket not found" {
			return err
		} else {
			return nil
		}
	})
}
