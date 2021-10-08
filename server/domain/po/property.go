package po

type Property struct {
	ID           uint `gorm:"primaryKey"`
	DeviceTypeID uint `gorm:"index"`
	SensorType   uint
	Name         string `gorm:"type:varchar(64)"`
	Unit         string `gorm:"type:varchar(16)"`
	Precision    int
	Fields       Fields `gorm:"type:json"`
}

func (Property) TableName() string {
	return "ts_property"
}
