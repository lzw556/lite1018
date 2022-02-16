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
				min := []byte(from.UTC().Format("2006-01-02T15:04:05Z"))
				max := []byte(to.UTC().Format("2006-01-02T15:04:05Z"))
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
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(entity.LargeSensorData{}.BucketName()))
		if bucket != nil {
			if dataBucket := bucket.Bucket([]byte(mac)); dataBucket != nil {
				v := dataBucket.Get([]byte(time.UTC().Format("2006-01-02T15:04:05Z")))
				if v != nil {
					return json.Unmarshal(v, &e)
				}
			}
		}
		return nil
	})
	return e, err
}
