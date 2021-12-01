package middleware

import (
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/casbin"
	"strings"
)

type CasbinRbac struct {
	exclusion []string
}

func NewCasbinRbac(exclusion ...string) Middleware {
	return CasbinRbac{
		exclusion: exclusion,
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
		roleID := ctx.GetString("role_id")
		if m.isSuperAdmin(ctx) {
			roleID = "admin"
		}
		if ok, _ := casbin.Enforcer().Enforce(roleID, path, method); ok {
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
