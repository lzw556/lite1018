package entity

type Menu struct {
	ID       uint   `gorm:"primaryKey"`
	Title    string `gorm:"type:varchar(32);not null"`
	Name     string `gorm:"type:varchar(64);not null"`
	Path     string `gorm:"type:varchar(128);not null"`
	Icon     string `gorm:"type:varchar(64);not null"`
	View     string `gorm:"type:varchar(64);not null"`
	ParentID uint
	Hidden   bool
	IsAuth   bool
	Sort     int
}

func (Menu) TableName() string {
	return "ts_menu"
}

type Menus []Menu
