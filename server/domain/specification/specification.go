package specification

import "gorm.io/gorm"

type Specification interface {
	IsSpecifiedBy(v interface{}) bool
	Scope() func(db *gorm.DB) *gorm.DB
}

type Specifications []Specification

func Scopes(specs []Specification) []func(db *gorm.DB) *gorm.DB {
	scopes := make([]func(db *gorm.DB) *gorm.DB, len(specs))
	for i, spec := range specs {
		scopes[i] = spec.Scope()
	}
	return scopes
}
