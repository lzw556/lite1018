package service

import (
	"context"
	"errors"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/role"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/factory"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"gorm.io/gorm"
)

type Role struct {
	repository dependency.RoleRepository
	factory    factory.Role
}

func NewRole() role.Service {
	return Role{
		repository: repository.Role{},
		factory:    factory.NewRole(),
	}
}

func (s Role) CreateRole(req request.Role) error {
	ctx := context.TODO()
	e, err := s.repository.GetBySpecs(ctx, spec.NameEqSpec(req.Name))
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return response.BusinessErr(errcode.RoleExistsError, "")
	}
	e.Name = req.Name
	e.Description = req.Description
	return s.repository.Create(ctx, &e)
}

func (s Role) UpdateRole(id uint, req request.Role) error {
	ctx := context.TODO()
	e, err := s.repository.Get(ctx, id)
	if err != nil {
		return response.BusinessErr(errcode.RoleNotFoundError, "")
	}
	e.Name = req.Name
	e.Description = req.Description
	return s.repository.Save(ctx, &e)
}

func (s Role) GetRolesByPaginate(page, size int) ([]vo.Role, int64, error) {
	ctx := context.TODO()
	es, total, err := s.repository.Paging(ctx, page, size)
	if err != nil {
		return nil, 0, err
	}
	result := make([]vo.Role, len(es))
	for i, e := range es {
		result[i] = vo.NewRole(e)
	}
	return result, total, nil
}

func (s Role) AllocMenus(id uint, req request.AllocMenus) error {
	cmd, err := s.factory.NewRoleCmd(id)
	if err != nil {
		return err
	}
	return cmd.AllocMenus(req.IDs)
}

func (s Role) GetRole(id uint) (*vo.Role, error) {
	query, err := s.factory.NewRoleQuery(id)
	if err != nil {
		return nil, err
	}
	return query.GetWithMenus()
}
