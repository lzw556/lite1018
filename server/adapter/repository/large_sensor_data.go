package repository

import (
	"bytes"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"go.etcd.io/bbolt"
	"time"
)

type LargeSensorData struct {
	repository
}

func (repo LargeSensorData) Create(e *entity.LargeSensorData) error {
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

func (repo LargeSensorData) Find(mac string, from, to time.Time) ([]entity.LargeSensorData, error) {
	var es []entity.LargeSensorData
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(entity.LargeSensorData{}.BucketName()))
		if bucket != nil {
			if dataBucket := bucket.Bucket([]byte(mac)); dataBucket != nil {
				c := dataBucket.Cursor()
				min := []byte(from.Format("2006-01-02T15:04:05Z"))
				max := []byte(to.Format("2006-01-02T15:04:05Z"))
				for k, v := c.Seek(min); k != nil && bytes.Compare(k, max) <= 0; k, v = c.Next() {
					var e entity.LargeSensorData
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

func (repo LargeSensorData) Get(mac string, time time.Time) (entity.LargeSensorData, error) {
	var e entity.LargeSensorData
	err := repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		if bucket != nil {
			if dataBucket := bucket.Bucket([]byte(mac)); dataBucket != nil {
				c := dataBucket.Cursor()
				current := []byte(time.UTC().Format("2006-01-02T15:04:05Z"))
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
