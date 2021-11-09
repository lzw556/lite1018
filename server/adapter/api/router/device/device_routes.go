package device

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

func (r deviceRouter) create(ctx *gin.Context) (interface{}, error) {
	var req request.Device
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.CreateDevice(req)
}

func (r deviceRouter) getByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetDevice(id)
}

func (r deviceRouter) paging(ctx *gin.Context) (interface{}, error) {
	assetID := cast.ToInt(ctx.Query("assetId"))
	page := cast.ToInt(ctx.Query("page"))
	size := cast.ToInt(ctx.Query("size"))
	var req request.DeviceSearch
	if err := json.Unmarshal([]byte(ctx.Query("search")), &req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	result, total, err := r.service.FindDevicesByPaginate(assetID, page, size, req)
	if err != nil {
		return nil, err
	}
	return response.NewPageResult(page, size, total, result), nil
}

func (r deviceRouter) statistic(_ *gin.Context) (interface{}, error) {
	return r.service.Statistic()
}

func (r deviceRouter) updateByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.Device
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.UpdateDevice(id, req)
}

func (r deviceRouter) executeCommand(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	cmd := cast.ToUint(ctx.Param("cmd"))
	return nil, r.service.ExecuteCommand(id, cmd)
}

func (r deviceRouter) getSettingByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetDeviceSetting(id)
}

func (r deviceRouter) updateSettingByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.DeviceSetting
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.UpdateDeviceSetting(id, req)
}

func (r deviceRouter) checkMacAddress(ctx *gin.Context) (interface{}, error) {
	mac := ctx.Param("mac")
	return nil, r.service.CheckDeviceMacAddress(mac)
}

func (r deviceRouter) replaceByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	mac := ctx.Param("mac")
	return nil, r.service.ReplaceDevice(id, mac)
}

func (r deviceRouter) removeByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.RemoveDevice(id)
}

func (r deviceRouter) findPropertyDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	propertyID := cast.ToUint(ctx.Param("pid"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	return r.service.GetPropertyDataByID(id, propertyID, from, to)
}

func (r deviceRouter) findDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	return r.service.FindDeviceDataByID(id, from, to)
}

func (r deviceRouter) downloadDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	propertyID := cast.ToUint(ctx.Query("pid"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	result, err := r.service.GetPropertyDataByID(id, propertyID, from, to)
	if err != nil {
		return nil, err
	}
	return result.ToExcelFile()
}

func (r deviceRouter) removeDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToInt(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	return nil, r.service.RemoveDataByID(id, from, to)
}

func (r deviceRouter) findGroupByAsset(ctx *gin.Context) (interface{}, error) {
	deviceType := cast.ToUint(ctx.Query("device_type"))
	return r.service.FindDevicesGroupByAsset(deviceType)
}

func (r deviceRouter) getChildren(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetChildren(id)
}

func (r deviceRouter) upgrade(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.DeviceUpgrade
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.ExecuteDeviceUpgrade(id, req)
}

func (r deviceRouter) cancelUpgrade(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.ExecuteDeviceCancelUpgrade(id)
}
