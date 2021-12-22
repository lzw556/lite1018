package repository

import (
	"bytes"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"go.etcd.io/bbolt"
	"time"
)

type DeviceData struct {
	repository
}

func (repo DeviceData) Create(e po.DeviceData) error {
	return repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists([]byte(e.BucketName()))
		if err != nil {
			return err
		}
		dataBucket, err := bucket.CreateBucketIfNotExists([]byte(e.MacAddress))
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

func (repo DeviceData) Find(mac string, from, to time.Time) ([]po.DeviceData, error) {
	var es []po.DeviceData
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(po.DeviceData{}.BucketName()))
		if bucket != nil {
			if dataBucket := bucket.Bucket([]byte(mac)); dataBucket != nil {
				c := dataBucket.Cursor()
				min := []byte(from.Format("2006-01-02T15:04:05Z"))
				max := []byte(to.Format("2006-01-02T15:04:05Z"))
				for k, v := c.Seek(min); k != nil && bytes.Compare(k, max) <= 0; k, v = c.Next() {
					var e po.DeviceData
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

func (repo DeviceData) Get(mac string, time time.Time) (po.DeviceData, error) {
	var e po.DeviceData
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(po.DeviceData{}.BucketName()))
		if bucket != nil {
			if dataBucket := bucket.Bucket([]byte(mac)); dataBucket != nil {
				c := dataBucket.Cursor()
				current := []byte(time.Format("2006-01-02T15:04:05Z"))
				var buf []byte
				if k, v := c.Seek(current); k != nil {
					buf = v
				} else if bytes.Compare(k, current) <= 0 {
					_, buf = c.Next()
				}
				if err := json.Unmarshal(buf, &e); err != nil {
					return err
				}
			}
		}
		return nil
	})
	return e, err
}

func (repo DeviceData) Top(mac string, limit int) ([]po.DeviceData, error) {
	var es []po.DeviceData
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(po.DeviceData{}.BucketName()))
		if bucket != nil {
			if dataBucket := bucket.Bucket([]byte(mac)); dataBucket != nil {
				c := dataBucket.Cursor()
				for k, v := c.Last(); k != nil && len(es) < limit; k, v = c.Prev() {
					var e po.DeviceData
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

func (repo DeviceData) Last(mac string) (po.DeviceData, error) {
	var e po.DeviceData
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		if bucket != nil {
			if dataBucket := bucket.Bucket([]byte(mac)); dataBucket != nil {
				c := dataBucket.Cursor()
				_, v := c.Last()
				if len(v) > 0 {
					if err := json.Unmarshal(v, &e); err != nil {
						return err
					}
				}
			}
		}
		return nil
	})
	return e, err
}

func (repo DeviceData) Delete(mac string, from, to time.Time) error {
	err := repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(po.DeviceData{}.BucketName()))
		if bucket != nil {
			if dataBucket := bucket.Bucket([]byte(mac)); dataBucket != nil {
				c := dataBucket.Cursor()
				min := []byte(from.Format("2006-01-02T15:04:05Z"))
				max := []byte(to.Format("2006-01-02T15:04:05Z"))
				for k, _ := c.Seek(min); k != nil && bytes.Compare(k, max) <= 0; k, _ = c.Next() {
					if err := dataBucket.Delete(k); err != nil {
						return err
					}
				}
			}
		}
		return nil
	})
	return err
}
