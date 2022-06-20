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

func (repo DeviceState) Create(mac string, e entity.DeviceStatus) error {
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
		k := time.Now().Format("2006-01-02T15:00:00Z")
		return dataBucket.Put([]byte(k), buf)
	})
}

func (repo DeviceState) Get(mac string) (entity.DeviceStatus, error) {
	var e entity.DeviceStatus
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

func (repo DeviceState) Find(mac string, from, to time.Time) ([]entity.DeviceStatus, error) {
	var es []entity.DeviceStatus
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(entity.DeviceStatus{}.BucketName()))
		if bucket != nil {
			if dataBucket := bucket.Bucket([]byte(mac)); dataBucket != nil {
				c := dataBucket.Cursor()
				min := []byte(from.UTC().Format("2006-01-02T15:04:02Z"))
				max := []byte(to.UTC().Format("2006-01-02T15:04:02Z"))
				for k, v := c.Seek(min); k != nil && bytes.Compare(k, max) <= 0; k, v = c.Next() {
					var e entity.DeviceStatus
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
		bucket := tx.Bucket([]byte(entity.DeviceStatus{}.BucketName()))
		if err := bucket.DeleteBucket([]byte(mac)); err != nil && err.Error() != "bucket not found" {
			return err
		} else {
			return nil
		}
	})
	return err
}
