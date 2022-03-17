package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type UserDeleteCmd struct {
	entity.User

	userRepo                dependency.UserRepository
	userProjectRelationRepo dependency.UserProjectRelationRepository
}

func NewUserDeleteCmd() UserDeleteCmd {
	return UserDeleteCmd{
		userRepo:                repository.User{},
		userProjectRelationRepo: repository.UserProjectRelation{},
	}
}

func (cmd UserDeleteCmd) Run() error {
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.userProjectRelationRepo.DeleteBySpecs(txCtx, spec.UserEqSpec(cmd.User.ID)); err != nil {
			return err
		}
		return cmd.userRepo.Delete(txCtx, cmd.User.ID)
	})
}
