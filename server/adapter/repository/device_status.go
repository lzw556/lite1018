package repository

import (
	"bytes"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"go.etcd.io/bbolt"
	"time"
)

type DeviceStatus struct {
	repository
}

func (repo DeviceStatus) Create(mac string, e po.DeviceStatus) error {
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
		return dataBucket.Put([]byte(e.Time.UTC().Format("2006-01-02T15:04:05Z")), buf)
	})
}

func (repo DeviceStatus) Get(mac string) (po.DeviceStatus, error) {
	var e po.DeviceStatus
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

func (repo DeviceStatus) Find(mac string, from, to time.Time) ([]po.DeviceStatus, error) {
	var es []po.DeviceStatus
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(po.DeviceStatus{}.BucketName()))
		if bucket != nil {
			if dataBucket := bucket.Bucket([]byte(mac)); dataBucket != nil {
				c := dataBucket.Cursor()
				min := []byte(from.UTC().Format("2006-01-02T15:04:05Z"))
				max := []byte(to.UTC().Format("2006-01-02T15:04:05Z"))
				for k, v := c.Seek(min); k != nil && bytes.Compare(k, max) <= 0; k, v = c.Next() {
					var e po.DeviceStatus
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

func (repo DeviceStatus) Delete(mac string) error {
	err := repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(po.DeviceStatus{}.BucketName()))
		dataBucket, err := bucket.CreateBucketIfNotExists([]byte(mac))
		if err != nil {
			return err
		}
		return dataBucket.DeleteBucket([]byte(mac))
	})
	return err
}
