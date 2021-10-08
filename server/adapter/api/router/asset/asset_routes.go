package asset

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
)

func (r assetRouter) create(ctx *gin.Context) (interface{}, error) {
	var req request.Asset
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.CreateAsset(req)
}

func (r assetRouter) updateByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.Asset
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return r.service.UpdateAsset(id, req)
}

func (r assetRouter) getByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetAsset(id)
}

func (r assetRouter) paging(ctx *gin.Context) (interface{}, error) {
	page := cast.ToInt(ctx.Query("page"))
	size := cast.ToInt(ctx.Query("size"))
	result, total, err := r.service.FindAssetsByPaginate(page, size)
	if err != nil {
		return nil, err
	}
	return response.NewPageResult(page, size, total, result), nil
}

func (r assetRouter) removeByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.RemoveAsset(id)
}
