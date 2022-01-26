package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
)

type ProjectChecker struct {
	repository dependency.ProjectRepository
	exclusion  []string
}

func NewProjectChecker(exclusion ...string) Middleware {
	return &ProjectChecker{
		repository: repository.Project{},
		exclusion:  exclusion,
	}
}

func (m ProjectChecker) WrapHandler() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		for _, ignore := range m.exclusion {
			if pathMatch(ctx.Request.URL.Path, ignore) {
				ctx.Next()
				return
			}
		}

		project := ctx.GetHeader("Project")
		if project == "" {
			response.Forbidden(ctx, response.BusinessErr(errcode.ProjectNotSelectedError, ""))
			return
		}
		ctx.Set("project_id", project)
		ctx.Next()
	}
}
