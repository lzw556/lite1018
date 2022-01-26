package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
)

type ProjectQuery struct {
	po.Project
	userProjectRelationRepo dependency.UserProjectRelationRepository
	userRepo                dependency.UserRepository
}

func NewProjectQuery() ProjectQuery {
	return ProjectQuery{
		userProjectRelationRepo: repository.UserProjectRelation{},
		userRepo:                repository.User{},
	}
}

func (query ProjectQuery) GetAllocUsers() ([]vo.AllocUser, error) {
	ctx := context.TODO()
	users, err := query.userRepo.FindBySpecs(ctx)
	if err != nil {
		return nil, err
	}
	es, err := query.userProjectRelationRepo.FindBySpecs(ctx, spec.ProjectEqSpec(query.Project.ID))
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
