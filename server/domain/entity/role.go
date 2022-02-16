package entity

type Role struct {
	ID          uint   `gorm:"primaryKey"`
	Name        string `gorm:"type:varchar(16)"`
	Description string `gorm:"type:varchar(255)"`
}

func (Role) TableName() string {
	return "ts_role"
}
