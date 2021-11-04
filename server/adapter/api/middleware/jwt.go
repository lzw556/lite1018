package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/jwt"
	"strings"
)

type JWT struct {
	repository dependency.UserRepository
	exclusion  []string
}

func NewJWT(exclusion ...string) Middleware {
	return JWT{
		repository: repository.User{},
		exclusion:  exclusion,
	}
}

func (m JWT) WrapHandler() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		for _, ignore := range m.exclusion {
			if pathMatch(ctx.Request.URL.Path, ignore) {
				ctx.Next()
				return
			}
		}

		authorization := ctx.GetHeader("Authorization")
		if authorization == "" {
			response.UnauthorizedWithError(ctx, response.BusinessErr(errcode.InvalidTokenError, ""))
			ctx.Abort()
			return
		}

		parts := strings.SplitN(authorization, " ", 2)
		if len(parts) != 2 {
			response.UnauthorizedWithError(ctx, response.BusinessErr(errcode.InvalidTokenError, ""))
			ctx.Abort()
			return
		}

		switch parts[0] {
		case "Bearer":
			tokenClaims, err := jwt.ParseToken(parts[1])
			if err != nil {
				response.UnauthorizedWithError(ctx, response.BusinessErr(errcode.InvalidTokenError, err.Error()))
			}
			ctx.Set("user_id", tokenClaims.UserID)
			ctx.Next()
			return
		default:
			response.UnauthorizedWithError(ctx, response.BusinessErr(errcode.InvalidTokenError, ""))
			ctx.Abort()
			return
		}
	}
}
