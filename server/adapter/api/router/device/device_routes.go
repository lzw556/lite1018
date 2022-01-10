package device

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

func (r deviceRouter) getDeviceTypeParameters(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	result, err := devicetype.GetParameter(id)
	if err != nil {
		return nil, response.BusinessErr(err.(errcode.BusinessErrorCode), "")
	}
	return result, nil
}

func (r deviceRouter) create(ctx *gin.Context) (interface{}, error) {
	var req request.Device
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.CreateDevice(req)
}

func (r deviceRouter) get(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetDeviceByID(id)
}

func (r deviceRouter) find(ctx *gin.Context) (interface{}, error) {
	method := ctx.Query("method")
	filters := request.NewFilters(ctx.Request.URL.Query())
	switch method {
	case "paging":
		page := cast.ToInt(ctx.Query("page"))
		size := cast.ToInt(ctx.Query("size"))
		result, total, err := r.service.FindDevicesByPaginate(page, size, filters)
		if err != nil {
			return nil, err
		}
		return response.NewPageResult(page, size, total, result), nil
	default:
		return r.service.FilterDevices(filters)
	}
}

func (r deviceRouter) statisticalDevices(ctx *gin.Context) (interface{}, error) {
	filters := request.NewFilters(ctx.Request.URL.Query())
	return r.service.GetDevicesStatistics(filters)
}

func (r deviceRouter) update(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.Device
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.UpdateDeviceByID(id, req)
}

func (r deviceRouter) executeCommand(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	cmd := cast.ToUint(ctx.Param("cmd"))
	return nil, r.service.ExecuteCommandByID(id, cmd)
}

func (r deviceRouter) getSettingByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetDeviceSettingByID(id)
}

func (r deviceRouter) updateSettingByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.DeviceSetting
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.UpdateDeviceSettingByID(id, req)
}

func (r deviceRouter) checkMacAddress(ctx *gin.Context) (interface{}, error) {
	mac := ctx.Param("mac")
	return nil, r.service.CheckDeviceMacAddress(mac)
}

func (r deviceRouter) replaceByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	mac := ctx.Param("mac")
	return nil, r.service.ReplaceDeviceByID(id, mac)
}

func (r deviceRouter) delete(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.DeleteDeviceByID(id)
}

func (r deviceRouter) findDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	pid := cast.ToUint(ctx.Query("pid"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	if pid == 0 {
		return r.service.FindDeviceDataByID(id, from, to)
	}
	return r.service.GetPropertyDataByID(id, pid, from, to)
}

func (r deviceRouter) downloadDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	var pids []uint
	if err := json.Unmarshal([]byte(ctx.Query("pids")), &pids); err != nil {
		return nil, err
	}
	result, err := r.service.GetPropertyDataByIDs(id, pids, from, to)
	if err != nil {
		return nil, err
	}
	return result.ToExcelFile()
}

func (r deviceRouter) removeDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	return nil, r.service.RemoveDataByID(id, from, to)
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
	if req.Type == 1 {
		return nil, r.service.ExecuteDeviceUpgradeByID(id, req)
	}
	return nil, r.service.ExecuteDeviceCancelUpgradeByID(id)
}
