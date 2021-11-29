package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type RoleCmd struct {
	po.Role

	roleMenuRepo dependency.RoleMenuRelationRepository
}

func NewRoleCmd() RoleCmd {
	return RoleCmd{
		roleMenuRepo: repository.RoleMenuRelation{},
	}
}

func (cmd RoleCmd) AllocMenus(ids []uint) error {
	ctx := context.TODO()
	es := make([]po.RoleMenuRelation, len(ids))
	for i, id := range ids {
		es[i] = po.RoleMenuRelation{
			RoleID: cmd.Role.ID,
			MenuID: id,
		}
	}
	return transaction.Execute(ctx, func(txCtx context.Context) error {
		if err := cmd.roleMenuRepo.DeleteBySpecs(txCtx, spec.RoleEqSpec(cmd.Role.ID)); err != nil {
			return err
		}
		return cmd.roleMenuRepo.BatchCreate(txCtx, es)
	})
}
