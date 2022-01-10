package asset

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
)

func (r assetRouter) create(ctx *gin.Context) (interface{}, error) {
	var req request.Asset
	if err := ctx.ShouldBind(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	if req.CheckFileSize() {
		return nil, response.BusinessErr(errcode.AssetImageSizeTooLargeError, "")
	}
	return nil, r.service.CreateAsset(req)
}

func (r assetRouter) update(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.Asset
	if err := ctx.ShouldBind(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	if req.CheckFileSize() {
		return nil, response.BusinessErr(errcode.AssetImageSizeTooLargeError, "")
	}
	return nil, r.service.UpdateAssetByID(id, req)
}

func (r assetRouter) get(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetAssetByID(id)
}

func (r assetRouter) find(ctx *gin.Context) (interface{}, error) {
	switch ctx.Query("method") {
	case "paging":
		page := cast.ToInt(ctx.Query("page"))
		size := cast.ToInt(ctx.Query("size"))
		result, total, err := r.service.FindAssetsByPaginate(page, size)
		if err != nil {
			return nil, err
		}
		return response.NewPageResult(page, size, total, result), nil
	default:
		return r.service.FindAssets()
	}
}

func (r assetRouter) statisticalAsset(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.StatisticalAssetByID(id)
}

func (r assetRouter) statisticalAssets(_ *gin.Context) (interface{}, error) {
	return r.service.StatisticalAssets()
}

func (r assetRouter) delete(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.DeleteAssetByID(id)
}

func (r assetRouter) getChildren(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetAssetChildrenByID(id)
}

func (r assetRouter) measurementStatistics(ctx *gin.Context) (interface{}, error) {
	return nil, nil
}
