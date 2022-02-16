package ruleengine

import (
	"bytes"
	"github.com/bilibili/gengine/engine"
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
	//alarmRepo := repository.Alarm{}
	//alarms, err := alarmReentity.FindBySpecs(context.TODO())
	//if err != nil {
	//	panic(err)
	//}
	//if len(alarms) > 0 {
	//	if err := UpdateRules(alarms...); err != nil {
	//		panic(err)
	//	}
	//}
}

func UpdateRules(alarms ...entity.Alarm) error {
	buf := bytes.Buffer{}
	for _, a := range alarms {
		buf.WriteString(a.RuleSpec())
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
