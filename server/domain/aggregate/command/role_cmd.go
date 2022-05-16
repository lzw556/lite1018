package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type RoleCmd struct {
	entity.Role

	roleMenuRepo   dependency.RoleMenuRelationRepository
	permissionRepo dependency.PermissionRepository
	userRepo       dependency.UserRepository
	roleRepo       dependency.RoleRepository
}

func NewRoleCmd() RoleCmd {
	return RoleCmd{
		roleMenuRepo:   repository.RoleMenuRelation{},
		permissionRepo: repository.Permission{},
		userRepo:       repository.User{},
		roleRepo:       repository.Role{},
	}
}

func (cmd RoleCmd) AllocMenus(ids []uint) error {
	ctx := context.TODO()
	es := make([]entity.RoleMenuRelation, len(ids))
	for i, id := range ids {
		es[i] = entity.RoleMenuRelation{
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

func (cmd RoleCmd) Remove() error {
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.roleRepo.Delete(txCtx, cmd.Role.ID); err != nil {
			return err
		}
		if err := cmd.roleMenuRepo.DeleteBySpecs(txCtx, spec.RoleEqSpec(cmd.Role.ID)); err != nil {
			return err
		}
		updates := map[string]interface{}{
			"role_id": 0,
		}
		return cmd.userRepo.UpdatesBySpecs(txCtx, updates, spec.RoleEqSpec(cmd.Role.ID))
	})
}
