package po

import (
	"bytes"
	"gorm.io/gorm"
	"text/template"
)

type Alarm struct {
	gorm.Model
	Name          string `gorm:"type:varchar(30)"`
	Description   string `gorm:"type:varchar(128)"`
	MeasurementID uint
	Rule          AlarmRule `gorm:"type:json"`
	Level         uint
	Enabled       bool `gorm:"default:1;not null"`
}

func (Alarm) TableName() string {
	return "ts_alarm"
}

func (a Alarm) RuleSpec() string {
	t, err := template.New("rule").Parse(`
RULE "{{.Name}}" "{{.Description}}" SALIENCE {{.Level}} 
BEGIN
value = scene.{{.Rule.Method}}()
if value {{.Rule.Operation}} {{.Rule.Threshold}} {
	scene.Alert(value)
}else{
	scene.Recovery()
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
	return buf.String()
}

type Alarms []Alarm
