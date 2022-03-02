package service

import (
	"context"
	"errors"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/project"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/factory"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"gorm.io/gorm"
)

type Project struct {
	repository dependency.ProjectRepository
	factory    factory.Project
}

func NewProject() project.Service {
	return &Project{
		repository: repository.Project{},
		factory:    factory.NewProject(),
	}
}

func (s Project) CreateProject(req request.Project) error {
	ctx := context.TODO()
	e, err := s.repository.GetBySpecs(ctx, spec.NameEqSpec(req.Name))
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return response.BusinessErr(errcode.ProjectExistsError, "")
	}
	e = entity.Project{
		Name:        req.Name,
		Description: req.Description,
	}
	return s.repository.Create(context.TODO(), &e)
}

func (s Project) GetProjectByID(id uint) (*vo.Project, error) {
	panic("implement me")
}

func (s Project) FindProjectsByPaginate(page, size int, filters request.Filters) ([]vo.Project, int64, error) {
	es, total, err := s.repository.PagingBySpecs(context.TODO(), page, size)
	if err != nil {
		return nil, 0, err
	}
	result := make([]vo.Project, len(es))
	for i, e := range es {
		result[i] = vo.NewProject(e)
	}
	return result, total, nil
}

func (s Project) FindProjects(filters request.Filters) ([]vo.Project, error) {
	query := s.factory.NewProjectQuery(filters)
	return query.List()
}

func (s Project) UpdateProjectByID(id uint, req request.Project) error {
	ctx := context.TODO()
	e, err := s.repository.Get(ctx, id)
	if err != nil {
		return response.BusinessErr(errcode.ProjectNotFoundError, "")
	}
	e.Name = req.Name
	e.Description = req.Description
	return s.repository.Save(ctx, &e)
}

func (s Project) GetAllocUsersByID(id uint) ([]vo.AllocUser, error) {
	query := s.factory.NewProjectQuery(nil)
	return query.GetAllocUsersByID(id)
}

func (s Project) AllocUsersByID(id uint, req request.AllocUsers) error {
	cmd, err := s.factory.NewProjectUpdateCmd(id)
	if err != nil {
		return err
	}
	return cmd.AllocUsers(req.UserIDs)
}

func (s Project) DeleteProjectByID(id uint) error {
	panic("implement me")
}
