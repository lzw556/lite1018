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
	ctx := context.TODO()
	e, err := s.repository.Get(ctx, id)
	if err != nil {
		return nil, response.BusinessErr(errcode.ProjectNotFoundError, "")
	}
	result := vo.NewProject(e)
	return &result, nil
}

func (s Project) PagingProjects(page, size int, filters request.Filters) ([]vo.Project, int64, error) {
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
	cmd, err := s.factory.NewProjectDeleteCmd(id)
	if err != nil {
		return err
	}
	return cmd.Run()
}

func (s Project) GenProjectAccessToken(id uint) error {
	cmd, err := s.factory.NewProjectUpdateCmd(id)
	if err != nil {
		return err
	}
	return cmd.GenAccessToken()
}

func (s Project) GetMyProjectExportFile(id uint) (*vo.ProjectExported, error) {
	cmd, err := s.factory.NewProjectExportCmd(id)
	if err != nil {
		return nil, err
	}
	return cmd.Run()
}

func isInArray(target uint, arr []uint) bool {
	for _, x := range arr {
		if x == target {
			return true
		}
	}

	return false
}

func getOneDevice(asset *vo.AssetExported) string {
	for _, mp := range asset.MonitoringPoints {
		for _, dev := range mp.Devices {
			return dev.Address
		}
	}

	for _, child := range asset.Children {
		return getOneDevice(child)
	}

	return ""
}

func findDeviceNetwork(mac string, networks []*vo.NetworkExportFile) *vo.NetworkExportFile {
	for i, network := range networks {
		for _, dev := range network.DeviceList {
			if dev.Address == mac {
				return networks[i]
			}
		}
	}

	return nil
}

func (s Project) GetMyProjectExportFileWithFilters(id uint, monitoringPointIDs []uint) (*vo.ProjectExported, error) {
	cmd, err := s.factory.NewProjectExportCmd(id)
	if err != nil {
		return nil, err
	}
	all, err := cmd.Run()

	if err != nil || len(monitoringPointIDs) == 0 {
		return all, err
	}

	resultAssets := make([]*vo.AssetExported, 0)
	resultNetworks := make([]*vo.NetworkExportFile, 0)

	for i, asset := range all.Assets {
		if isInArray(asset.ID, monitoringPointIDs) {
			resultAssets = append(resultAssets, all.Assets[i])
		}
	}

	for _, asset := range resultAssets {
		devMac := getOneDevice(asset)
		if len(devMac) > 0 {
			network := findDeviceNetwork(devMac, all.Networks)
			if network != nil {
				resultNetworks = append(resultNetworks, network)
			}
		}
	}

	return &vo.ProjectExported{
		ID:       all.ID,
		Name:     all.Name,
		Assets:   resultAssets,
		Networks: resultNetworks,
	}, nil
}

func (s Project) ImportProject(id uint, req request.ProjectImported) error {
	cmd, err := s.factory.NewProjectImportCmd(id)
	if err != nil {
		return err
	}

	return cmd.ImportProject(req)
}
