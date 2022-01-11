package factory

import (
	"context"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/command"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
)

type Project struct {
	projectRepo             dependency.ProjectRepository
	userProjectRelationRepo dependency.UserProjectRelationRepository
}

func NewProject() Project {
	return Project{
		projectRepo:             repository.Project{},
		userProjectRelationRepo: repository.UserProjectRelation{},
	}
}

func (factory Project) NewProjectQuery(id uint) (*query.ProjectQuery, error) {
	e, err := factory.projectRepo.Get(context.TODO(), id)
	if err != nil {
		return nil, response.BusinessErr(errcode.ProjectNotFoundError, "")
	}
	q := query.NewProjectQuery()
	q.Project = e
	return &q, nil
}

func (factory Project) NewProjectFilterQuery(filters request.Filters) (*query.ProjectFilterQuery, error) {
	specs := factory.buildSpecs(filters)
	es, err := factory.projectRepo.FindBySpecs(context.TODO(), specs...)
	if err != nil {
		return nil, err
	}
	q := query.NewProjectFilterQuery()
	q.Projects = es
	return &q, nil
}

func (factory Project) NewProjectUpdateCmd(id uint) (*command.ProjectUpdateCmd, error) {
	e, err := factory.projectRepo.Get(context.TODO(), id)
	if err != nil {
		return nil, response.BusinessErr(errcode.ProjectNotFoundError, "")
	}
	cmd := command.NewProjectUpdateCmd()
	cmd.Project = e
	return &cmd, nil
}

func (factory Project) buildSpecs(filters request.Filters) []spec.Specification {
	specs := make([]spec.Specification, 0)
	for _, filter := range filters {
		switch filter.Name {
		case "user_id":
			if cast.ToUint(filter.Value) != 1 {
				if relations, err := factory.userProjectRelationRepo.FindBySpecs(context.TODO(), spec.UserEqSpec(cast.ToUint(filter.Value))); err == nil {
					primaryKeyInSpec := make(spec.PrimaryKeyInSpec, len(relations))
					for i, relation := range relations {
						primaryKeyInSpec[i] = relation.ProjectID
					}
					specs = append(specs, primaryKeyInSpec)
				}
			}
		}
	}
	return specs
}
