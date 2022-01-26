package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type ProjectUpdateCmd struct {
	po.Project

	userProjectRelationRepo dependency.UserProjectRelationRepository
}

func NewProjectUpdateCmd() ProjectUpdateCmd {
	return ProjectUpdateCmd{
		userProjectRelationRepo: repository.UserProjectRelation{},
	}
}

func (cmd ProjectUpdateCmd) AllocUsers(userIDs []uint) error {
	relations := make([]po.UserProjectRelation, len(userIDs))
	for i, userID := range userIDs {
		relations[i] = po.UserProjectRelation{
			UserID:    userID,
			ProjectID: cmd.Project.ID,
		}
	}
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.userProjectRelationRepo.DeleteBySpecs(txCtx, spec.ProjectEqSpec(cmd.Project.ID)); err != nil {
			return err
		}
		if len(relations) > 0 {
			return cmd.userProjectRelationRepo.BatchCreate(txCtx, relations)
		}
		return nil
	})
}
