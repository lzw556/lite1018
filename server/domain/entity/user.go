package entity

import (
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username string `gorm:"type:varchar(16)"`
	Password string `gorm:"type:varchar(128)"`
	Phone    string `gorm:"type:varchar(16)"`
	Email    string `gorm:"type:varchar(64)"`
	RoleID   uint
}

func (User) TableName() string {
	return "ts_user"
}

func (u *User) BeforeCreate(_ *gorm.DB) error {
	password, err := bcrypt.GenerateFromPassword([]byte(u.Password), 0)
	if err != nil {
		return err
	}
	u.Password = string(password)
	return nil
}
