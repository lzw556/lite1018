package project

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	CreateProject(req request.Project) error
	GetProjectByID(id uint) (*vo.Project, error)
	FindProjectsByPaginate(page, size int, filters request.Filters) ([]vo.Project, int64, error)
	FilterProjects(filters request.Filters) ([]vo.Project, error)
	UpdateProjectByID(id uint, req request.Project) error
	DeleteProjectByID(id uint) error

	GetAllocUsersByID(id uint) ([]vo.AllocUser, error)
	AllocUsersByID(id uint, req request.AllocUsers) error
}
