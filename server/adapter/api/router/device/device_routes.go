package device

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

func (r deviceRouter) create(ctx *gin.Context) (interface{}, error) {
	var req request.Device
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	req.ProjectID = cast.ToUint(ctx.MustGet("project_id"))
	return nil, r.service.CreateDevice(req)
}

func (r deviceRouter) get(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetDeviceByID(id)
}

func (r deviceRouter) find(ctx *gin.Context) (interface{}, error) {
	filters := request.NewFilters(ctx)
	if _, ok := ctx.GetQuery("page"); ok {
		page := cast.ToInt(ctx.Query("page"))
		size := cast.ToInt(ctx.Query("size"))
		result, total, err := r.service.FindDevicesByPaginate(page, size, filters)
		if err != nil {
			return nil, err
		}
		return response.NewPageResult(page, size, total, result), nil
	}
	return r.service.FilterDevices(filters)
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
	return r.service.GetDeviceSettingsByID(id)
}

func (r deviceRouter) defaultSettings(ctx *gin.Context) (interface{}, error) {
	typeID := cast.ToUint(ctx.Query("type"))
	if t := devicetype.Get(typeID); t != nil {
		result := vo.NewDeviceSettings(t.Settings())
		return result, nil
	}
	return nil, response.BusinessErr(errcode.UnknownDeviceTypeError, "")
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
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	return r.service.FindDeviceDataByID(id, from, to)
}

func (r deviceRouter) findRuntimeDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	return r.service.GetRuntimeDataByID(id, from, to)
}

func (r deviceRouter) findWaveDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	return r.service.FindWaveDataByID(id, from, to)
}

func (r deviceRouter) getLastDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetLastDeviceDataByID(id)
}

func (r deviceRouter) getWaveDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	timestamp := cast.ToInt64(ctx.Param("timestamp"))
	calculate := ctx.Query("calculate")
	return r.service.GetWaveDataByID(id, timestamp, calculate)
}

func (r deviceRouter) downloadWaveDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	timestamp := cast.ToInt64(ctx.Param("timestamp"))
	result, err := r.service.GetWaveDataByID(id, timestamp, ctx.Query("calculate"))
	if err != nil {
		return nil, err
	}
	return result.ToCsvFile()
}

func (r deviceRouter) downloadDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	var pids []string
	if err := json.Unmarshal([]byte(ctx.Query("pids")), &pids); err != nil {
		return nil, err
	}
	return r.service.DownloadDeviceDataByID(id, pids, from, to)
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
