package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type UserCreateCmd struct {
	entity.User

	userRepo                dependency.UserRepository
	userProjectRelationRepo dependency.UserProjectRelationRepository
}

func NewUserCreateCmd() UserCreateCmd {
	return UserCreateCmd{
		userRepo:                repository.User{},
		userProjectRelationRepo: repository.UserProjectRelation{},
	}
}

func (cmd UserCreateCmd) Run(projects []uint) error {
	relations := make([]entity.UserProjectRelation, len(projects))
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.userRepo.Create(txCtx, &cmd.User); err != nil {
			return err
		}
		if len(projects) > 0 {
			for i, project := range projects {
				relations[i] = entity.UserProjectRelation{
					UserID:    cmd.User.ID,
					ProjectID: project,
				}
			}
			return cmd.userProjectRelationRepo.BatchCreate(txCtx, relations)
		}
		return nil
	})
}
