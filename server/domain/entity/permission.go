package entity

type Permission struct {
	ID          uint   `gorm:"primaryKey;autoIncrement;"`
	Path        string `gorm:"type:varchar(255);unique_index"`
	Method      string `gorm:"type:varchar(16);unique_index"`
	Group       string `gorm:"type:varchar(64);"`
	Description string `gorm:"type:varchar(255)"`
}

func (Permission) TableName() string {
	return "ts_permission"
}
