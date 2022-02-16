package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type ProjectFilterQuery struct {
	entity.Projects
}

func NewProjectFilterQuery() ProjectFilterQuery {
	return ProjectFilterQuery{}
}

func (query ProjectFilterQuery) Run() []vo.Project {
	result := make([]vo.Project, len(query.Projects))
	for i, project := range query.Projects {
		result[i] = vo.NewProject(project)
	}
	return result
}
