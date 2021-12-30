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
	return r.service.CreateMeasurement(req)
}

func (r measurementRouter) checkDeviceBinding(ctx *gin.Context) (interface{}, error) {
	mac := ctx.Param("mac")
	return nil, r.service.CheckDeviceBinding(mac)
}

func (r measurementRouter) find(ctx *gin.Context) (interface{}, error) {
	var req = request.NewFilters(ctx.Request.URL.Query())
	switch ctx.Query("method") {
	case "paging":
		return nil, nil
	default:
		return r.service.FilterMeasurements(req)
	}
}

func (r measurementRouter) getByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetMeasurement(id)
}

func (r measurementRouter) updateByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.CreateMeasurement
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.UpdateMeasurementByID(id, req)
}

func (r measurementRouter) statistical(ctx *gin.Context) (interface{}, error) {
	assetID := cast.ToUint(ctx.Query("assetId"))
	return r.service.GetMeasurementStatistics(assetID)
}

func (r measurementRouter) getStatistic(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetMeasurementStatistic(id)
}

func (r measurementRouter) getFields(ctx *gin.Context) (interface{}, error) {
	typeID := cast.ToUint(ctx.Query("type"))
	variables := measurementtype.Variables[measurementtype.Type(typeID)]
	result := make([]vo.MeasurementField, 0)
	for _, v := range variables {
		result = append(result, vo.MeasurementField{
			Variable: v,
		})
	}
	return result, nil
}

func (r measurementRouter) updateSettings(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.MeasurementSettings
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.UpdateMeasurementSettings(id, req)
}

func (r measurementRouter) bindingDevices(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.UpdateMeasurementDeviceBindings
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.UpdateMeasurementDeviceBindings(id, req)
}

func (r measurementRouter) getData(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	return r.service.GetMeasurementData(id, from, to)
}

func (r measurementRouter) getRawData(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	return r.service.GetMeasurementRawData(id, from, to)
}

func (r measurementRouter) downloadRawData(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	timestamp := cast.ToInt64(ctx.Param("timestamp"))
	result, err := r.service.GetMeasurementRawDataByTimestamp(id, timestamp)
	if err != nil {
		return nil, err
	}
	return result.ToCsvFile()
}

func (r measurementRouter) getRawDataByTimestamp(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	timestamp := cast.ToInt64(ctx.Param("timestamp"))
	return r.service.GetMeasurementRawDataByTimestamp(id, timestamp)
}

func (r measurementRouter) removeByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.RemoveMeasurementByID(id)
}

func (r measurementRouter) removeDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	return nil, r.service.RemoveMeasurementDataByID(id, from, to)
}
