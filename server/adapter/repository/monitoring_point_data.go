package repository

import (
	"bytes"
	"fmt"
	"time"

	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"go.etcd.io/bbolt"
)

type MonitoringPointData struct {
	repository
}

func (repo MonitoringPointData) Create(e entity.MonitoringPointData) error {
	return repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists([]byte(e.BucketName()))
		if err != nil {
			return err
		}
		mpBucket, err := bucket.CreateBucketIfNotExists([]byte(fmt.Sprintf("MP%d", e.MonitoringPointID)))
		if err != nil {
			return err
		}
		buf, err := json.Marshal(e)

		return mpBucket.Put([]byte(e.Time.UTC().Format("2006-01-02T15:04:05Z")), buf)
	})
}

func (repo MonitoringPointData) Find(mpId uint, from, to time.Time) ([]entity.MonitoringPointData, error) {
	var es []entity.MonitoringPointData

	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(entity.MonitoringPointData{}.BucketName()))
		if bucket != nil {
			if mpBucket := bucket.Bucket([]byte(fmt.Sprintf("MP%d", mpId))); mpBucket != nil {
				c := mpBucket.Cursor()
				min := []byte(from.UTC().Format("2006-01-02T15:04:05Z"))
				max := []byte(to.UTC().Format("2006-01-02T15:04:05Z"))
				for k, v := c.Seek(min); k != nil && bytes.Compare(k, max) <= 0; k, v = c.Next() {
					var e entity.MonitoringPointData
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

func (repo MonitoringPointData) Get(mpId uint, time time.Time) (entity.MonitoringPointData, error) {
	var e entity.MonitoringPointData
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(entity.MonitoringPointData{}.BucketName()))
		if bucket != nil {
			if mpBucket := bucket.Bucket([]byte(fmt.Sprintf("MP%d", mpId))); mpBucket != nil {
				c := mpBucket.Cursor()
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

func (repo MonitoringPointData) Top(mpId uint, limit int) ([]entity.MonitoringPointData, error) {
	var es []entity.MonitoringPointData
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(entity.MonitoringPointData{}.BucketName()))
		if bucket != nil {
			if mpBucket := bucket.Bucket([]byte(fmt.Sprintf("MP%d", mpId))); mpBucket != nil {
				c := mpBucket.Cursor()
				for k, v := c.Last(); k != nil && len(es) < limit; k, v = c.Prev() {
					var e entity.MonitoringPointData
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

func (repo MonitoringPointData) Last(mpId uint) (entity.MonitoringPointData, error) {
	var e entity.MonitoringPointData
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		if bucket != nil {
			if mpBucket := bucket.Bucket([]byte(fmt.Sprintf("MP%d", mpId))); mpBucket != nil {
				c := mpBucket.Cursor()
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

func (repo MonitoringPointData) Delete(mpId uint, from, to time.Time) error {
	err := repo.BoltDB().Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(entity.MonitoringPointData{}.BucketName()))
		if bucket != nil {
			if mpBucket := bucket.Bucket([]byte(fmt.Sprintf("MP%d", mpId))); mpBucket != nil {
				c := mpBucket.Cursor()
				min := []byte(from.UTC().Format("2006-01-02T15:04:05Z"))
				max := []byte(to.UTC().Format("2006-01-02T15:04:05Z"))
				for k, _ := c.Seek(min); k != nil && bytes.Compare(k, max) <= 0; k, _ = c.Next() {
					if err := mpBucket.Delete(k); err != nil {
						return err
					}
				}
			}
		}
		return nil
	})
	return err
}

func (repo MonitoringPointData) FindTimes(mpId uint, from, to time.Time) ([]time.Time, error) {
	var es []time.Time
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(entity.MonitoringPointData{}.BucketName()))
		if bucket != nil {
			if mpBucket := bucket.Bucket([]byte(fmt.Sprintf("MP%d", mpId))); mpBucket != nil {
				c := mpBucket.Cursor()
				min := []byte(from.UTC().Format("2006-01-02T15:04:05Z"))
				max := []byte(to.UTC().Format("2006-01-02T15:04:05Z"))
				for k, _ := c.Seek(min); k != nil && bytes.Compare(k, max) <= 0; k, _ = c.Next() {
					date, _ := time.Parse("2006-01-02T15:04:05Z", string(k))
					es = append(es, date)
				}
			}
		}
		return nil
	})
	return es, err
}
