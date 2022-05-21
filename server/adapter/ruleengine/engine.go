package ruleengine

import (
	"bytes"
	"context"
	"github.com/bilibili/gengine/engine"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/ruleengine/rule"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

var pool *engine.GenginePool

const defaultRule = `
RULE "default" ""
BEGIN
END`

func Init() {
	e, err := engine.NewGenginePool(10, 20, 1, defaultRule, map[string]interface{}{})
	if err != nil {
		panic(err)
	}
	pool = e
	initRules()
}

func initRules() {
	alarmRuleRepo := repository.AlarmRule{}
	alarmRules, err := alarmRuleRepo.FindBySpecs(context.TODO())
	if err != nil {
		panic(err)
	}
	if len(alarmRules) > 0 {
		if err := UpdateRules(alarmRules...); err != nil {
			panic(err)
		}
	}
}

func UpdateRules(alarmRules ...entity.AlarmRule) error {
	buf := bytes.Buffer{}
	for _, r := range alarmRules {
		if s := r.RuleSpec(); len(s) > 0 {
			buf.WriteString(s)
		}
	}
	return pool.UpdatePooledRulesIncremental(buf.String())
}

func RemoveRules(names ...string) error {
	return pool.RemoveRules(names)
}

func ExecuteSelectedRules(sourceID uint, rules ...entity.AlarmRule) {
	for _, r := range rules {
		var alert Rule
		if r.IsEnabled() {
			switch r.Category {
			case entity.AlarmRuleCategoryDevice:
				alert = rule.NewDeviceAlert(sourceID, r)
			case entity.AlarmRuleCategoryMonitoringPoint:
				alert = rule.NewMonitoringPointAlert(sourceID, r)
			}
			if err := alert.Execute(pool); err != nil {
				return
			}
		}
	}
}
