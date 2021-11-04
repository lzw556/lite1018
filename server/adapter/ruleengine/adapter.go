package ruleengine

import (
	"bytes"
	"context"
	"fmt"
	"github.com/bilibili/gengine/engine"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/ruleengine/scene"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type Adapter struct {
	pool          *engine.GenginePool
	alarmRuleRepo dependency.AlarmRuleRepository
	propertyRepo  dependency.PropertyRepository
}

func NewAdapter() *Adapter {
	e, err := engine.NewGenginePool(10, 20, 1, defaultRule, map[string]interface{}{})
	if err != nil {
		panic(err)
	}
	a := &Adapter{
		pool:          e,
		alarmRuleRepo: repository.AlarmRule{},
		propertyRepo:  repository.Property{},
	}
	a.initRules()
	return a
}

func (a *Adapter) initRules() {
	es, err := a.alarmRuleRepo.FindBySpecs(context.TODO())
	if err != nil {
		panic(err)
	}
	buf := bytes.Buffer{}
	for _, e := range es {
		buf.WriteString(toPropertyRule(e))
	}
	if len(buf.String()) > 0 {
		if err := a.pool.UpdatePooledRules(buf.String()); err != nil {
			panic(err)
		}
	}
}

func (a *Adapter) UpdateRules(rules ...po.AlarmRule) error {
	buf := bytes.Buffer{}
	for _, rule := range rules {
		buf.WriteString(toPropertyRule(rule))
	}
	return a.pool.UpdatePooledRulesIncremental(buf.String())
}

func (a *Adapter) RemoveRules(names ...string) error {
	return a.pool.RemoveRules(names)
}

func (a *Adapter) ExecuteSelectedRules(device entity.Device, rules []po.AlarmRule) {
	for _, rule := range rules {
		e, err := a.propertyRepo.Get(context.TODO(), rule.PropertyID)
		if err != nil {
			return
		}
		property := scene.NewProperty(e, device)
		data := map[string]interface{}{}
		data["property"] = property
		data["println"] = fmt.Println
		err, _ = a.pool.ExecuteSelectedRules(data, []string{rule.Name})
		if err != nil {
			xlog.Errorf("rule %s execute failed: %v", rule.Name, err)
			return
		}
	}
}
