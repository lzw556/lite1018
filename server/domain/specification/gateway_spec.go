package specification

import "gorm.io/gorm"

type GatewaySpec uint

func (GatewaySpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s GatewaySpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("gateway_id = ?", s)
	}
}
