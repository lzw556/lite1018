package alarm

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

func (r alarmRouter) createAlarmRuleTemplate(ctx *gin.Context) (interface{}, error) {
	var req request.AlarmRuleTemplate
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.CreateAlarmRuleTemplate(req)
}

func (r alarmRouter) pagingAlarmRuleTemplates(ctx *gin.Context) (interface{}, error) {
	page := cast.ToInt(ctx.Query("page"))
	size := cast.ToInt(ctx.Query("size"))
	deviceType := cast.ToUint(ctx.Query("device_type"))
	result, total, err := r.service.FindAlarmRuleTemplatesByPaginate(page, size, deviceType)
	if err != nil {
		return nil, err
	}
	return response.NewPageResult(page, size, total, result), nil
}

func (r alarmRouter) getAlarmRuleTemplate(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetAlarmRuleTemplate(id)
}

func (r alarmRouter) updateAlarmRuleTemplate(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.AlarmRuleTemplate
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return r.service.UpdateAlarmRuleTemplate(id, req)
}

func (r alarmRouter) removeAlarmRuleTemplate(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.RemoveAlarmRuleTemplate(id)
}

func (r alarmRouter) checkAlarmRule(ctx *gin.Context) (interface{}, error) {
	name := ctx.Param("name")
	return nil, r.service.CheckAlarmRule(name)
}

func (r alarmRouter) createAlarmRule(ctx *gin.Context) (interface{}, error) {
	var req request.AlarmRule
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.CreateAlarmRule(req)
}

func (r alarmRouter) pagingAlarmRules(ctx *gin.Context) (interface{}, error) {
	page := cast.ToInt(ctx.Query("page"))
	size := cast.ToInt(ctx.Query("size"))
	assetID := cast.ToUint(ctx.Query("assetId"))
	deviceID := cast.ToUint(ctx.Query("deviceId"))
	result, total, err := r.service.FindAlarmRulesByPaginate(assetID, deviceID, page, size)
	if err != nil {
		return nil, err
	}
	return response.NewPageResult(page, size, total, result), nil
}

func (r alarmRouter) getAlarmRules(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetAlarmRule(id)
}

func (r alarmRouter) updateAlarmRule(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.UpdateAlarmRule
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.UpdateAlarmRule(id, req)
}

func (r alarmRouter) removeAlarmRule(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.RemoveAlarmRule(id)
}

func (r alarmRouter) pagingAlarmRecords(ctx *gin.Context) (interface{}, error) {
	page := cast.ToInt(ctx.Query("page"))
	size := cast.ToInt(ctx.Query("size"))
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	var req request.AlarmFilter
	if err := json.Unmarshal([]byte(ctx.Query("filter")), &req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	result, total, err := r.service.FindAlarmRecordsByPaginate(from, to, page, size, req)
	if err != nil {
		return nil, err
	}
	return response.NewPageResult(page, size, total, result), nil
}

func (r alarmRouter) getAlarmRecord(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetAlarmRecord(id)
}

func (r alarmRouter) removeAlarmRecord(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.RemoveAlarmRecord(id)
}

func (r alarmRouter) alarmStatistics(ctx *gin.Context) (interface{}, error) {
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	var req request.AlarmFilter
	if err := json.Unmarshal([]byte(ctx.Query("filter")), &req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return r.service.GetAlarmStatistics(from, to, req)
}
