package initialize

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"gorm.io/gorm"
)

func initProject(db *gorm.DB) error {
	project := entity.Project{
		Name:        "默认项目",
		Description: "默认项目",
	}
	err := db.FirstOrCreate(&project, map[string]interface{}{"name": "默认项目"}).Error
	if err != nil {
		return err
	}
	return nil
}
