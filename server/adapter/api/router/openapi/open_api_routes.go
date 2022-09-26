package openapi

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
)

func (r openApiRouter) findDevices(ctx *gin.Context) (interface{}, error) {
	projectID := cast.ToUint(ctx.MustGet("project_id"))
	return r.service.FindDevicesByProjectID(context.Background(), projectID)
}

func (r openApiRouter) getDeviceByMac(ctx *gin.Context) (interface{}, error) {
	projectID := cast.ToUint(ctx.MustGet("project_id"))
	mac := ctx.Param("mac")
	return r.service.GetDeviceByMac(context.Background(), mac, projectID)
}

func (r openApiRouter) findDeviceDataByMac(ctx *gin.Context) (interface{}, error) {
	projectID := cast.ToUint(ctx.MustGet("project_id"))
	mac := ctx.Param("mac")
	from := cast.ToInt64(ctx.Query("from"))
	if from <= 0 {
		return nil, response.ErrOpenApiBadRequest("无效的时间戳")
	}
	to := cast.ToInt64(ctx.Query("to"))
	if to <= 0 {
		return nil, response.ErrOpenApiBadRequest("无效的时间戳")
	}
	property := ctx.Query("property")
	return r.service.FindDeviceDataByMac(context.Background(), projectID, mac, property, from, to)
}

func (r openApiRouter) findAssets(ctx *gin.Context) (interface{}, error) {
	projectID := cast.ToUint(ctx.MustGet("project_id"))
	return r.service.FindAssetsByProjectID(context.Background(), projectID)
}

func (r openApiRouter) getAsset(ctx *gin.Context) (interface{}, error) {
	projectID := cast.ToUint(ctx.MustGet("project_id"))
	id := ctx.Param("id")
	return r.service.GetAsset(context.Background(), cast.ToUint(id), projectID)
}

func (r openApiRouter) findMonitoringPoints(ctx *gin.Context) (interface{}, error) {
	projectID := cast.ToUint(ctx.MustGet("project_id"))
	filters := request.NewFilters(ctx)
	return r.service.FindMonitoringPointsByProjectID(context.Background(), projectID, filters)
}

func (r openApiRouter) getMonitoringPoint(ctx *gin.Context) (interface{}, error) {
	projectID := cast.ToUint(ctx.MustGet("project_id"))
	id := ctx.Param("id")
	return r.service.GetMonitoringPoint(context.Background(), cast.ToUint(id), projectID)
}
