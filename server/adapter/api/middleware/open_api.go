package middleware

import (
	"encoding/base64"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/jwt"
)

type OpenApi struct {
}

func NewOpenApi() Middleware {
	return &OpenApi{}
}

func (m *OpenApi) WrapHandler() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		authorization := ctx.GetHeader("Authorization")
		if authorization == "" {
			ctx.JSON(http.StatusUnauthorized, response.ErrOpenApiInvalidToken())
			ctx.Abort()
			return
		}

		accessToken, err := base64.StdEncoding.DecodeString(authorization)
		if err != nil {
			ctx.JSON(http.StatusUnauthorized, response.ErrOpenApiInvalidToken())
			ctx.Abort()
			return
		}

		tokenClaims, err := jwt.ParseProjectToken(string(accessToken))
		if err != nil {
			ctx.JSON(http.StatusUnauthorized, response.ErrOpenApiInvalidToken())
			ctx.Abort()
			return
		}
		ctx.Set("project_id", tokenClaims.ID)
		ctx.Next()
	}
}
