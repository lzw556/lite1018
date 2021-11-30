package permission

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
)

func (r permissionRouter) create(ctx *gin.Context) (interface{}, error) {
	var req request.Permission
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, err
	}
	return nil, r.service.CreatePermission(req)
}

func (r permissionRouter) paging(ctx *gin.Context) (interface{}, error) {
	page := cast.ToInt(ctx.Query("page"))
	size := cast.ToInt(ctx.Query("size"))
	result, total, err := r.service.GetPermissionsByPaginate(page, size)
	if err != nil {
		return nil, err
	}
	return response.NewPageResult(page, size, total, result), nil
}

func (r permissionRouter) withGroup(ctx *gin.Context) (interface{}, error) {
	return r.service.GetPermissionsWithGroup()
}
