package middleware

import (
	"context"
	"errors"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/casbin"

	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"strings"
)

type CasbinRbac struct {
	repository dependency.RoleRepository
	exclusion  []string
}

func NewCasbinRbac(exclusion ...string) Middleware {
	return CasbinRbac{
		repository: repository.Role{},
		exclusion:  exclusion,
	}
}

func (m CasbinRbac) WrapHandler() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		for _, ignore := range m.exclusion {
			if pathMatch(ctx.Request.URL.Path, ignore) {
				ctx.Next()
				return
			}
		}
		path := strings.TrimPrefix(ctx.Request.URL.Path, "/api/")
		method := ctx.Request.Method
		roleName := ""
		if m.isSuperAdmin(ctx) {
			roleName = "admin"
		} else {
			if role, err := m.repository.Get(context.TODO(), cast.ToUint(ctx.GetString("role_id"))); err == nil {
				roleName = role.Name
			}
		}
		if ok, _ := casbin.Enforce(roleName, path, method); ok {
			ctx.Next()
			return
		}
		response.Forbidden(ctx, errors.New("权限不足"))
		ctx.Abort()
		return
	}
}

func (m CasbinRbac) isSuperAdmin(ctx *gin.Context) bool {
	userID := cast.ToInt(ctx.MustGet("user_id"))
	return userID == 1
}
