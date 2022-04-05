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
	if project.ID > 0 {
		var alarmTemplates []entity.AlarmTemplate
		err = db.Find(&alarmTemplates, "project_id = 0 OR project_id IS NULL").Error
		if err != nil {
			return err
		}
		for i := range alarmTemplates {
			alarmTemplates[i].ProjectID = project.ID
		}
		if len(alarmTemplates) > 0 {
			if err := db.Save(&alarmTemplates).Error; err != nil {
				return err
			}
		}
	}
	return nil
}
