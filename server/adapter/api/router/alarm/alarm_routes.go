package alarm

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
)

func (r alarmRouter) createAlarmRule(ctx *gin.Context) (interface{}, error) {
	var req request.AlarmRule
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	req.ProjectID = cast.ToUint(ctx.MustGet("project_id"))
	return nil, r.service.CreateAlarmRule(req)
}

func (r alarmRouter) findAlarmRules(ctx *gin.Context) (interface{}, error) {
	filters := request.NewFilters(ctx)
	if _, ok := ctx.GetQuery("page"); ok {
		page := cast.ToInt(ctx.Query("page"))
		size := cast.ToInt(ctx.Query("size"))
		result, total, err := r.service.FindAlarmRuleByPaginate(page, size, filters)
		if err != nil {
			return nil, err
		}
		return response.NewPageResult(page, size, total, result), nil
	}
	return nil, nil
}

func (r alarmRouter) getAlarmRule(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetAlarmRuleByID(id)
}

func (r alarmRouter) checkAlarmRuleName(ctx *gin.Context) (interface{}, error) {
	name := ctx.Param("name")
	return r.service.CheckAlarmRuleName(name)
}

func (r alarmRouter) updateAlarmRule(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.AlarmRule
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.UpdateAlarmRuleByID(id, req)
}

func (r alarmRouter) addSourcesToAlarmRule(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.AlarmSources
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.AddSourcesToAlarmRule(id, req.IDs)
}

func (r alarmRouter) removeSourcesFromAlarmRule(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.AlarmSources
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.RemoveSourcesFromAlarmRule(id, req.IDs)
}

func (r alarmRouter) updateAlarmRuleStatus(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	status := cast.ToUint8(ctx.Param("status"))
	return nil, r.service.UpdateAlarmRuleStatusByID(id, status)
}

func (r alarmRouter) deleteAlarmRule(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.DeleteAlarmRuleByID(id)
}

func (r alarmRouter) findAlarmRecords(ctx *gin.Context) (interface{}, error) {
	filters := request.NewFilters(ctx)
	if _, ok := ctx.GetQuery("page"); ok {
		page := cast.ToInt(ctx.Query("page"))
		size := cast.ToInt(ctx.Query("size"))
		result, total, err := r.service.FindAlarmRecordByPaginate(page, size, filters)
		if err != nil {
			return nil, err
		}
		return response.NewPageResult(page, size, total, result), nil
	}
	return nil, nil
}

func (r alarmRouter) acknowledgeAlarmRecord(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.AcknowledgeAlarmRecord
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	req.UserID = cast.ToUint(ctx.MustGet("user_id"))
	return nil, r.service.AcknowledgeAlarmRecordByID(id, req)
}

func (r alarmRouter) getAlarmRecordAcknowledge(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetAlarmRecordAcknowledgeByID(id)
}
