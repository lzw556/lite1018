package repository

import (
	"context"
	"encoding/binary"
	"log"
	"reflect"

	"github.com/thetasensors/theta-cloud-lite/server/pkg/global"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
	"go.etcd.io/bbolt"

	"gorm.io/gorm"
)

type repository struct{}

func (r repository) DB(ctx context.Context) *gorm.DB {
	v := ctx.Value(transaction.Key{})
	if v != nil {
		tx, ok := v.(*gorm.DB)
		if !ok {
			log.Panicf("unexpect context value type: %s", reflect.TypeOf(tx))
			return nil
		}
		return tx
	}
	return global.GetDB(ctx)
}

func (r repository) BoltDB() *bbolt.DB {
	return global.BoltDB
}

// itob returns an 8-byte big endian representation of v.
func itob(v uint) []byte {
	b := make([]byte, 8)
	binary.BigEndian.PutUint64(b, uint64(v))
	return b
}

func (r repository) paginate(page, size int) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if page == 0 {
			page = 1
		}
		switch {
		case size > 100:
			size = 100
		case size <= 0:
			size = 10
		}
		offset := (page - 1) * size
		return db.Offset(offset).Limit(size)
	}
}
