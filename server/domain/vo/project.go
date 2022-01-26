package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type Project struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

func NewProject(e po.Project) Project {
	return Project{
		ID:          e.ID,
		Name:        e.Name,
		Description: e.Description,
	}
}
