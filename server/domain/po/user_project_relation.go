package po

type UserProjectRelation struct {
	ID        uint `gorm:"primaryKey;autoIncrement"`
	UserID    uint
	ProjectID uint
}

func (UserProjectRelation) TableName() string {
	return "ts_user_project_relation"
}
