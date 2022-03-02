package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
)

type ProjectQuery struct {
	Specs []spec.Specification

	projectRepo             dependency.ProjectRepository
	userProjectRelationRepo dependency.UserProjectRelationRepository
	userRepo                dependency.UserRepository
}

func NewProjectQuery() ProjectQuery {
	return ProjectQuery{
		userRepo:                repository.User{},
		projectRepo:             repository.Project{},
		userProjectRelationRepo: repository.UserProjectRelation{},
	}
}

func (query ProjectQuery) check(id uint) (entity.Project, error) {
	e, err := query.projectRepo.Get(context.TODO(), id)
	if err != nil {
		return entity.Project{}, response.BusinessErr(errcode.ProjectNotFoundError, err.Error())
	}
	return e, nil
}

func (query ProjectQuery) GetAllocUsersByID(id uint) ([]vo.AllocUser, error) {
	project, err := query.check(id)
	if err != nil {
		return nil, err
	}

	ctx := context.TODO()
	users, err := query.userRepo.FindBySpecs(ctx)
	if err != nil {
		return nil, err
	}
	es, err := query.userProjectRelationRepo.FindBySpecs(ctx, spec.ProjectEqSpec(project.ID))
	if err != nil {
		return nil, response.BusinessErr(errcode.ProjectNotFoundError, "")
	}
	relation := make(map[uint]struct{})
	for _, e := range es {
		relation[e.UserID] = struct{}{}
	}
	result := make([]vo.AllocUser, len(users))
	for i, user := range users {
		result[i] = vo.NewAllocUser(user)
		_, result[i].IsAllocated = relation[user.ID]
	}
	return result, nil
}

func (query ProjectQuery) List() ([]vo.Project, error) {
	es, err := query.projectRepo.FindBySpecs(context.TODO(), query.Specs...)
	if err != nil {
		return nil, err
	}
	result := make([]vo.Project, len(es))
	for i, project := range es {
		result[i] = vo.NewProject(project)
	}
	return result, nil
}
