package entity

import (
	"bytes"
	"fmt"
	"gorm.io/gorm"
	"text/template"
)

type AlarmRuleCategory uint8

const (
	AlarmRuleCategoryDevice AlarmRuleCategory = iota + 1
	AlarmRuleCategoryAsset
)

type AlarmRule struct {
	gorm.Model
	Name        string `gorm:"type:varchar(30)"`
	Description string `gorm:"type:varchar(128)"`
	SourceType  uint
	Metric      AlarmRuleMetric `gorm:"type:json"`
	Duration    int
	Threshold   float64
	Operation   string `gorm:"type:varchar(8)"`
	Level       uint8
	Status      uint8 `gorm:"default:1;not null"`
	Category    AlarmRuleCategory
	ProjectID   uint `gorm:"index"`
}

func (AlarmRule) TableName() string {
	return "ts_alarm_rule"
}

func (a AlarmRule) IsEnabled() bool {
	return a.Status == 1
}

func (a AlarmRule) RuleSpec() string {
	t, err := template.New("AlarmRule").Parse(`
RULE "{{.Name}}" "{{.Description}}" SALIENCE {{.Level}}
BEGIN
v = rule.Value(source)
if v {{.Operation}} {{.Threshold}} {
rule.Alert(source, v)
}else{
rule.Recovery(source, v)
}
END
`)
	if err != nil {
		return ""
	}
	buf := bytes.Buffer{}
	err = t.Execute(&buf, a)
	if err != nil {
		return ""
	}
	fmt.Println(buf.String())
	return buf.String()
}

type AlarmRules []AlarmRule
