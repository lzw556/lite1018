package ruleengine

import (
	"bytes"
	"context"
	"github.com/bilibili/gengine/engine"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
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
	alarmRules, err := alarmRuleRepo.FindBySpecs(context.TODO(), spec.EnabledEqSpec(true))
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
	for _, rule := range alarmRules {
		buf.WriteString(rule.Name)
	}
	return pool.UpdatePooledRulesIncremental(buf.String())
}

func RemoveRules(names ...string) error {
	return pool.RemoveRules(names)
}

//func ExecuteSelectedRules(m entity.Measurement, alarms []entity.Alarm) {
//	for _, alarm := range alarms {
//		s := NewMeasurementAlert(m, alarm)
//		data := map[string]interface{}{}
//		data["scene"] = s
//		err, _ := pool.ExecuteSelectedRules(data, []string{alarm.Name})
//		if err != nil {
//			xlog.Errorf("rule %s execute failed: %v", alarm.Name, err)
//			return
//		}
//	}
//}
