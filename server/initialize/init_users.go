package initialize

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"gorm.io/gorm"
)

func initUsers(db *gorm.DB) error {
	user := po.User{
		Username: "admin",
		Password: "123456",
	}
	err := db.FirstOrCreate(&user, map[string]interface{}{"id": 1, "username": user.Username}).Error
	if err != nil {
		return err
	}
	return err
}
