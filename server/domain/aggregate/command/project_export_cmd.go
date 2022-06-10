package command

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type ProjectExportCmd struct {
	entity.Project

	assetRepo dependency.AssetRepository
}

func NewProjectExportCmd() ProjectExportCmd {
	return ProjectExportCmd{
		assetRepo: repository.Asset{},
	}
}

func (cmd ProjectExportCmd) Run() (*vo.ProjectExported, error) {
	result := vo.ProjectExported{}

	err := cmd.appendAssets(&result)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (cmd ProjectExportCmd) appendAssets(p *vo.ProjectExported) error {
	q := query.NewAssetQuery()
	q.Specs = []spec.Specification{spec.ProjectEqSpec(cmd.Project.ID)}
	_, err := q.List()
	if err != nil {
		return err
	}

	return nil
}
