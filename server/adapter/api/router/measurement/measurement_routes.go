package measurement

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"
)

func (r measurementRouter) create(ctx *gin.Context) (interface{}, error) {
	var req request.CreateMeasurement
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	req.ProjectID = cast.ToUint(ctx.MustGet("project_id"))
	return r.service.CreateMeasurement(req)
}

func (r measurementRouter) checkDeviceBinding(ctx *gin.Context) (interface{}, error) {
	mac := ctx.Param("mac")
	return nil, r.service.CheckDeviceBinding(mac)
}

func (r measurementRouter) find(ctx *gin.Context) (interface{}, error) {
	var req = request.NewFilters(ctx)
	switch ctx.Query("method") {
	case "paging":
		return nil, nil
	default:
		return r.service.FilterMeasurements(req)
	}
}

func (r measurementRouter) get(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetMeasurement(id)
}

func (r measurementRouter) update(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.CreateMeasurement
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.UpdateMeasurementByID(id, req)
}

func (r measurementRouter) getFields(ctx *gin.Context) (interface{}, error) {
	typeID := cast.ToUint(ctx.Query("type"))
	variables := measurementtype.Get(typeID).Variables()
	result := make([]vo.MeasurementField, 0)
	for _, v := range variables {
		result = append(result, vo.MeasurementField{
			Variable: v,
		})
	}
	return result, nil
}

func (r measurementRouter) getSettingsByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetMeasurementSettingsByID(id)
}

func (r measurementRouter) updateSettingsByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.MeasurementSettings
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.UpdateMeasurementSettingsByID(id, req)
}

func (r measurementRouter) bindingDevices(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.UpdateMeasurementDeviceBindings
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.UpdateMeasurementDeviceBindingsByID(id, req)
}

func (r measurementRouter) findDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	return r.service.GetMeasurementData(id, from, to)
}

func (r measurementRouter) findWaveDataTimestamp(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	return r.service.GetMeasurementRawData(id, from, to)
}

func (r measurementRouter) downloadWaveData(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	timestamp := cast.ToInt64(ctx.Param("timestamp"))
	result, err := r.service.GetMeasurementWaveDataByTimestamp(id, timestamp, ctx.Query("calculate"))
	if err != nil {
		return nil, err
	}
	return result.ToCsvFile()
}

func (r measurementRouter) findWaveDataByTimestamp(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	timestamp := cast.ToInt64(ctx.Param("timestamp"))
	return r.service.GetMeasurementWaveDataByTimestamp(id, timestamp, ctx.Query("calculate"))
}

func (r measurementRouter) delete(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.DeleteMeasurementByID(id)
}

func (r measurementRouter) removeDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	return nil, r.service.RemoveMeasurementDataByID(id, from, to)
}
