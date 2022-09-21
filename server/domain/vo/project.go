package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type Project struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Token       string `json:"token"`
}

func NewProject(e entity.Project) Project {
	return Project{
		ID:          e.ID,
		Name:        e.Name,
		Description: e.Description,
		Token:       e.Token,
	}
}
