package service

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/permission"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Permission struct {
	repository dependency.PermissionRepository
}

func NewPermission() permission.Service {
	return Permission{
		repository: repository.Permission{},
	}
}

func (s Permission) CreatePermission(req request.Permission) error {
	e := po.Permission{
		Path:        req.Path,
		Method:      req.Method,
		Description: req.Description,
		Group:       req.Group,
	}
	return s.repository.Create(context.TODO(), &e)
}

func (s Permission) UpdatePermission(id uint, req request.Permission) error {
	panic("implement me")
}

func (s Permission) GetPermissionsByPaginate(page, size int) ([]vo.Permission, int64, error) {
	es, total, err := s.repository.Paging(context.TODO(), page, size)
	if err != nil {
		return nil, 0, err
	}
	result := make([]vo.Permission, len(es))
	for i, e := range es {
		result[i] = vo.NewPermission(e)
	}
	return result, total, nil
}

func (s Permission) GetPermissionsWithGroup() (map[string][]vo.Permission, error) {
	es, err := s.repository.Find(context.TODO())
	if err != nil {
		return nil, err
	}
	result := make(map[string][]vo.Permission)
	for _, e := range es {
		if _, ok := result[e.Group]; !ok {
			result[e.Group] = make([]vo.Permission, 0)
		}
		result[e.Group] = append(result[e.Group], vo.NewPermission(e))
	}
	return result, nil
}
