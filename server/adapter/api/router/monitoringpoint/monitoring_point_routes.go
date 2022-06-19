package monitoringpoint

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/monitoringpointtype"
)

func (r monitoringPointRouter) create(ctx *gin.Context) (interface{}, error) {
	var req request.CreateMonitoringPoint
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}

	req.ProjectID = cast.ToUint(ctx.MustGet("project_id"))
	return r.service.CreateMonitoringPoint(req)
}

func (r monitoringPointRouter) get(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetMonitoringPointByID(id)
}

func (r monitoringPointRouter) update(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.UpdateMonitoringPoint
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}

	return nil, r.service.UpdateMonitoringPointByID(id, req)
}

func (r monitoringPointRouter) delete(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.DeleteMonitoringPointByID(id)
}

func (r monitoringPointRouter) bindDevice(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.BindDevice
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}

	return nil, r.service.BindDevice(id, req)
}

func (r monitoringPointRouter) unbindDevice(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.UnbindDevice
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}

	return nil, r.service.UnbindDevice(id, req)
}

func (r monitoringPointRouter) find(ctx *gin.Context) (interface{}, error) {
	filters := request.NewFilters(ctx)
	if _, ok := ctx.GetQuery("page"); ok {
		page := cast.ToInt(ctx.Query("page"))
		size := cast.ToInt(ctx.Query("size"))
		result, total, err := r.service.FindMonitoringPointsByPaginate(page, size, filters)
		if err != nil {
			return nil, err
		}
		return response.NewPageResult(page, size, total, result), nil
	}
	return r.service.FindMonitoringPoints(filters)
}

func (r monitoringPointRouter) findDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	if ctx.Query("type") == "raw" {
		return r.service.FindMonitoringPointRawDataByID(id, from, to)
	} else {
		return r.service.FindMonitoringPointDataByID(id, from, to)
	}
}

func (r monitoringPointRouter) getDataByIDAndTimestamp(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	timestamp := cast.ToInt64(ctx.Param("timestamp"))
	filters := request.NewFilters(ctx)
	return r.service.GetMonitoringPointDataByIDAndTimestamp(id, monitoringpointtype.MonitoringPointCategoryRaw, timestamp, filters)
}

func (r monitoringPointRouter) downloadDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	var pids []string
	if err := json.Unmarshal([]byte(ctx.Query("pids")), &pids); err != nil {
		return nil, err
	}
	return r.service.DownloadDataByID(id, pids, from, to, ctx.GetHeader("Timezone"))
}

func (r monitoringPointRouter) downloadDataByIDAndTimestamp(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	timestamp := cast.ToInt64(ctx.Param("timestamp"))
	filters := request.NewFilters(ctx)
	return r.service.DownloadDataByIDAndTimestmap(id, monitoringpointtype.MonitoringPointCategoryRaw, timestamp, filters)
}

func (r monitoringPointRouter) removeDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	var category uint = monitoringpointtype.MonitoringPointCategoryBasic
	if ctx.Query("type") == "raw" {
		category = monitoringpointtype.MonitoringPointCategoryRaw
	}
	return nil, r.service.RemoveDataByID(id, category, from, to)
}
