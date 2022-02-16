package initialize

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"gorm.io/gorm"
)

func initUsers(db *gorm.DB) error {
	user := entity.User{
		Username: "admin",
		Password: "123456",
	}
	err := db.FirstOrCreate(&user, map[string]interface{}{"id": 1, "username": user.Username}).Error
	if err != nil {
		return err
	}
	return err
}
