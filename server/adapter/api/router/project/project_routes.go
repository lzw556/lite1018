package project

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
)

func (r projectRouter) create(ctx *gin.Context) (interface{}, error) {
	var req request.Project
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.CreateProject(req)
}

func (r projectRouter) find(ctx *gin.Context) (interface{}, error) {
	filters := request.NewFilters(ctx)
	if _, ok := ctx.GetQuery("page"); ok {
		page := cast.ToInt(ctx.Query("page"))
		size := cast.ToInt(ctx.Query("size"))
		result, total, err := r.service.PagingProjects(page, size, filters)
		if err != nil {
			return nil, err
		}
		return response.NewPageResult(page, size, total, result), nil
	}
	return r.service.FindProjects(filters)
}

func (r projectRouter) getMyProjects(ctx *gin.Context) (interface{}, error) {
	userID := cast.ToUint(ctx.MustGet("user_id"))
	filters := request.Filters{
		"user_id": userID,
	}
	return r.service.FindProjects(filters)
}

func (r projectRouter) getMyProject(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetProjectByID(id)
}

func (r projectRouter) update(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.Project
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.UpdateProjectByID(id, req)
}

func (r projectRouter) get(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetProjectByID(id)
}

func (r projectRouter) delete(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.DeleteProjectByID(id)
}

func (r projectRouter) getAllocUsers(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetAllocUsersByID(id)
}

func (r projectRouter) allocUsers(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.AllocUsers
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.AllocUsersByID(id, req)
}

func (r projectRouter) getMyProjectExportFile(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetMyProjectExportFile(id)
}

func (r projectRouter) importProject(ctx *gin.Context) (interface{}, error) {
	var req request.ProjectImported
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, err
	}
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.ImportProject(id, req)
}
