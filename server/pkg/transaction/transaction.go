package transaction

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/global"

	"gorm.io/gorm"
)

type Key struct{}

func Execute(ctx context.Context, fn func(txCtx context.Context) error) error {
	db := global.GetDB(ctx)
	return db.Transaction(func(tx *gorm.DB) error {
		if ctx == nil {
			ctx = context.Background()
		}
		txCtx := context.WithValue(ctx, Key{}, tx)
		return fn(txCtx)
	})
}
