package ruleengine

import "github.com/bilibili/gengine/engine"

type Rule interface {
	Value(source interface{}) float64
	Execute(engine *engine.GenginePool) error
	Alert(source interface{}, value float64)
	Recovery(source interface{}, value float64)
}
