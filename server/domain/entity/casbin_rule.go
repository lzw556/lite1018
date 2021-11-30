package entity

type CasbinRule struct {
	ID     uint   `json:"id"`
	Ptype  string `json:"ptype" gorm:"column:ptype"`
	RoleID string `json:"roleId" gorm:"column:v0"`
	Path   string `json:"path" gorm:"column:v1"`
	Method string `json:"method" gorm:"column:v2"`
}
