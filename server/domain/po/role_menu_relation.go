package po

type RoleMenuRelation struct {
	ID     uint `gorm:"primaryKey"`
	RoleID uint
	MenuID uint
}

func (RoleMenuRelation) TableName() string {
	return "ts_role_menu_relation"
}
