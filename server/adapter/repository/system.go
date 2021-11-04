package repository

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"go.etcd.io/bbolt"
)

type System struct {
	repository
}

func (repo System) Get() (po.System, error) {
	var e po.System
	err := repo.BoltDB().View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(e.BucketName()))
		bytes := bucket.Get(itob(1))
		if len(bytes) > 0 {
			return json.Unmarshal(bytes, &e)
		}
		return nil
	})
	return e, err
}
