package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/casbin"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
	"strconv"
)

type RoleCmd struct {
	po.Role

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

func (cmd RoleCmd) AllocPermissions(ids []uint) error {
	roleID := strconv.Itoa(int(cmd.Role.ID))
	casbin.Clear(0, roleID)
	permissions, err := cmd.permissionRepo.FindBySpecs(context.TODO(), spec.PrimaryKeyInSpec(ids))
	if err != nil {
		return err
	}
	var rules [][]string
	for _, permission := range permissions {
		cu := entity.CasbinRule{
			Ptype:  "p",
			RoleID: roleID,
			Path:   permission.Path,
			Method: permission.Method,
		}
		rules = append(rules, []string{roleID, cu.Path, cu.Method})
	}
	e := casbin.Enforcer()
	if ok, err := e.AddPolicies(rules); !ok && err != nil {
		return err
	}
	return nil
}

func (cmd RoleCmd) Remove() error {
	casbin.Clear(0, strconv.Itoa(int(cmd.Role.ID)))
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
