package ruleengine

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"strings"
)

const propertyRuleTemplate = `
RULE "%s" "%s" SALIENCE %d
BEGIN
device = %d
data = property.%s(device,"%s")
alarm = %d
if !isNil(data) {
value = property.Value(data)
if value %s %f {
property.Alert(alarm, value, %d)
}else {
property.Recovery(alarm, value)
}
}
END`

func toPropertyRule(e po.AlarmRule) string {
	return fmt.Sprintf(propertyRuleTemplate, e.Name, e.Description, e.Level, e.DeviceID, strings.ToUpper(e.Rule.Method), e.Rule.Field, e.ID, e.Rule.Operation, e.Rule.Threshold, e.Level)
}

const defaultRule = `
RULE "default" ""
BEGIN
END`
