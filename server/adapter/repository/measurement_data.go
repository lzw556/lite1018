package repository

import (
	"bytes"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"go.etcd.io/bbolt"
	"time"
)

type MeasurementData struct {
	repository
}

func (repo MeasurementData) Create(e po.MeasurementData) error {
	return repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists([]byte(e.BucketName()))
		if err != nil {
			return err
		}
		dataBucket, err := bucket.CreateBucketIfNotExists(itob(e.MeasurementID))
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

func (repo MeasurementData) Last(id uint) (po.MeasurementData, error) {
	var e po.MeasurementData
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		if bucket != nil {
			if dataBucket := bucket.Bucket(itob(id)); dataBucket != nil {
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

func (repo MeasurementData) FindAll(id uint) ([]po.MeasurementData, error) {
	var es []po.MeasurementData
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(po.MeasurementData{}.BucketName()))
		if bucket != nil {
			if dataBucket := bucket.Bucket(itob(id)); dataBucket != nil {
				c := dataBucket.Cursor()
				for k, v := c.First(); k != nil; k, v = c.Next() {
					var e po.MeasurementData
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

func (repo MeasurementData) Find(id uint, from, to time.Time) ([]po.MeasurementData, error) {
	var es []po.MeasurementData
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(po.MeasurementData{}.BucketName()))
		if bucket != nil {
			min := []byte(from.Format("2006-01-02T15:04:05Z"))
			max := []byte(to.Format("2006-01-02T15:04:05Z"))
			if dataBucket := bucket.Bucket(itob(id)); dataBucket != nil {
				c := dataBucket.Cursor()
				for k, v := c.Seek(min); k != nil && bytes.Compare(k, max) <= 0; k, v = c.Next() {
					var e po.MeasurementData
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
