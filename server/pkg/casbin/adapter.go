package casbin

import (
	"github.com/casbin/casbin/v2"
	"github.com/casbin/casbin/v2/model"
	gormadapter "github.com/casbin/gorm-adapter/v3"
	"gorm.io/gorm"
	"sync"
)

var (
	syncedEnforcer *casbin.SyncedEnforcer
	once           sync.Once
)

type adapter struct {
	model string
	db    *gorm.DB
}

var a *adapter

func Init(model string, db *gorm.DB) {
	a = &adapter{
		model: model,
		db:    db,
	}
}

func Clear(v int, p ...string) bool {
	e := Enforcer()
	success, _ := e.RemoveFilteredPolicy(v, p...)
	return success
}

func Enforcer() *casbin.SyncedEnforcer {
	once.Do(func() {
		dbAdapter, _ := gormadapter.NewAdapterByDB(a.db)
		m, _ := model.NewModelFromString(a.model)
		syncedEnforcer, _ = casbin.NewSyncedEnforcer(m, dbAdapter)
	})
	_ = syncedEnforcer.LoadPolicy()
	return syncedEnforcer
}

func Model() string {
	return a.model
}
