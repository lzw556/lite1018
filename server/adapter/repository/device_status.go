package repository

import (
	"bytes"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"go.etcd.io/bbolt"
	"time"
)

type DeviceState struct {
	repository
}

func (repo DeviceState) Create(mac string, e entity.DeviceState) error {
	return repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		dataBucket, err := bucket.CreateBucketIfNotExists([]byte(mac))
		if err != nil {
			return err
		}
		buf, err := json.Marshal(e)
		if err != nil {
			return err
		}
		k := time.Unix(e.ConnectedAt, 0).UTC().Format("2006-01-02")
		return dataBucket.Put([]byte(k), buf)
	})
}

func (repo DeviceState) Get(mac string) (entity.DeviceState, error) {
	var e entity.DeviceState
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		if dataBucket := bucket.Bucket([]byte(mac)); dataBucket != nil {
			if k, v := dataBucket.Cursor().Last(); k != nil {
				return json.Unmarshal(v, &e)
			}
		}
		return nil
	})
	return e, err
}

func (repo DeviceState) Find(mac string, from, to time.Time) ([]entity.DeviceState, error) {
	var es []entity.DeviceState
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(entity.DeviceState{}.BucketName()))
		if bucket != nil {
			if dataBucket := bucket.Bucket([]byte(mac)); dataBucket != nil {
				c := dataBucket.Cursor()
				min := []byte(from.UTC().Format("2006-01-02"))
				max := []byte(to.UTC().Format("2006-01-02"))
				for k, v := c.Seek(min); k != nil && bytes.Compare(k, max) <= 0; k, v = c.Next() {
					var e entity.DeviceState
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

func (repo DeviceState) Delete(mac string) error {
	err := repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(entity.DeviceState{}.BucketName()))
		dataBucket, err := bucket.CreateBucketIfNotExists([]byte(mac))
		if err != nil {
			return err
		}
		return dataBucket.DeleteBucket([]byte(mac))
	})
	return err
}
