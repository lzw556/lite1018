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
	var req request.CreateDevice
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	req.ProjectID = cast.ToUint(ctx.MustGet("project_id"))
	return nil, r.service.CreateDevice(req)
}

func (r deviceRouter) get(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	filters := request.NewFilters(ctx)
	return r.service.GetDeviceByID(id, filters)
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
	return r.service.FindDevices(filters)
}

func (r deviceRouter) update(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.UpdateDevice
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.UpdateDeviceByID(id, req)
}

func (r deviceRouter) executeCommand(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	cmd := cast.ToUint(ctx.Param("cmd"))
	var req request.DeviceCommand
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.ExecuteCommandByID(id, cmd, req)
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

func (r deviceRouter) delete(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.DeleteDeviceByID(id)
}

func (r deviceRouter) findDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	sensorType := cast.ToUint(ctx.Query("data_type"))
	return r.service.FindDeviceDataByID(id, sensorType, from, to)
}

func (r deviceRouter) getDataByIDAndTimestamp(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	timestamp := cast.ToInt64(ctx.Param("timestamp"))
	sensorType := cast.ToUint(ctx.Query("data_type"))
	filters := request.NewFilters(ctx)
	return r.service.GetDeviceDataByIDAndTimestamp(id, sensorType, timestamp, filters)
}

func (r deviceRouter) findRuntimeDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	return r.service.GetRuntimeDataByID(id, from, to)
}

func (r deviceRouter) downloadDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	var pids []string
	if err := json.Unmarshal([]byte(ctx.Query("pids")), &pids); err != nil {
		return nil, err
	}
	return r.service.DownloadDeviceDataByID(id, pids, from, to, ctx.GetHeader("Timezone"))
}

func (r deviceRouter) downloadDataByIDAndTimestamp(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	timestamp := cast.ToInt64(ctx.Param("timestamp"))
	sensorType := cast.ToUint(ctx.Query("data_type"))
	filters := request.NewFilters(ctx)
	return r.service.DownloadDeviceDataByIDAndTimestamp(id, sensorType, timestamp, filters)
}

func (r deviceRouter) removeDataByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	sensorType := cast.ToUint(ctx.Query("data_type"))
	return nil, r.service.RemoveDataByID(id, sensorType, from, to)
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

func (r deviceRouter) findEventsByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	if _, ok := ctx.GetQuery("page"); ok {
		page := cast.ToInt(ctx.Query("page"))
		size := cast.ToInt(ctx.Query("size"))
		result, total, err := r.service.PagingDeviceEventsByID(id, from, to, page, size)
		if err != nil {
			return nil, err
		}
		return response.NewPageResult(page, size, total, result), nil
	}
	return r.service.FindDeviceEventsByID(id, from, to)
}

func (r deviceRouter) removeEventsByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	events := struct {
		IDs []uint `json:"ids"`
	}{}
	if err := ctx.ShouldBindJSON(&events); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.RemoveDeviceEventsByID(id, events.IDs)
}

func (r deviceRouter) findAlarmRulesByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.FindDeviceAlarmRulesByID(id)
}

func (r deviceRouter) addAlarmRulesByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.DeviceAlarmRules
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.AddDeviceAlarmRules(id, req)
}

func (r deviceRouter) removeAlarmRulesByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.DeviceAlarmRules
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.RemoveDeviceAlarmRulesByID(id, req)
}
