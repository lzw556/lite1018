package entity

type AlarmSourceType string

const (
	AlarmSourceTypeDevice = "device"
	AlarmSourceTypeAsset  = "asset"
)

type AlarmSource struct {
	ID          uint `gorm:"primaryKey;autoIncrement"`
	SourceID    uint `gorm:"index;not null"`
	AlarmRuleID uint `gorm:"index;not null"`
}

func (AlarmSource) TableName() string {
	return "ts_alarm_source"
}
