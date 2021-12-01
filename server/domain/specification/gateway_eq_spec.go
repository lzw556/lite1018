package specification

import "gorm.io/gorm"

type GatewayEqSpec uint

func (GatewayEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s GatewayEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("gateway_id = ?", s)
	}
}
