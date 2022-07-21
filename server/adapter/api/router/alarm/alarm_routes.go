package alarm

import (
	"strings"

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
		result, total, err := r.service.PagingAlarmRules(page, size, filters)
		if err != nil {
			return nil, err
		}
		return response.NewPageResult(page, size, total, result), nil
	}
	return r.service.FindAlarmRules(filters)
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
		from := cast.ToInt64(ctx.Query("from"))
		to := cast.ToInt64(ctx.Query("to"))
		result, total, err := r.service.FindAlarmRecordByPaginate(page, size, from, to, filters)
		if err != nil {
			return nil, err
		}
		return response.NewPageResult(page, size, total, result), nil
	}
	return nil, nil
}

func (r alarmRouter) getAlarmRecord(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetAlarmRecordByID(id)
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

func (r alarmRouter) deleteAlarmRecord(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.DeleteAlarmRecordByID(id)
}

func (r alarmRouter) getAlarmRecordAcknowledge(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetAlarmRecordAcknowledgeByID(id)
}

func (r alarmRouter) createAlarmRuleGroup(ctx *gin.Context) (interface{}, error) {
	var req request.AlarmRuleGroup
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}

	req.ProjectID = cast.ToUint(ctx.MustGet("project_id"))
	return nil, r.service.CreateAlarmRuleGroup(req)
}

func (r alarmRouter) deleteAlarmRuleGroup(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.DeleteAlarmRuleGroupByID(id)
}

func (r alarmRouter) getAlarmRuleGroup(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetAlarmRuleGroupByID(id)
}

func (r alarmRouter) findAlarmRuleGroups(ctx *gin.Context) (interface{}, error) {
	filters := request.NewFilters(ctx)
	return r.service.FindAlarmRuleGroups(filters)
}

func (r alarmRouter) alarmRuleGroupBind(ctx *gin.Context) (interface{}, error) {
	var req request.AlarmRuleGroupBind
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.AlarmRuleGroupBind(id, req)
}

func (r alarmRouter) alarmRuleGroupUnbind(ctx *gin.Context) (interface{}, error) {
	var req request.AlarmRuleGroupUnbind
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.AlarmRuleGroupUnbind(id, req)
}

func (r alarmRouter) updateAlarmRuleGroup(ctx *gin.Context) (interface{}, error) {
	var req request.UpdateAlarmRuleGroup
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.UpdateAlarmRuleGroup(id, req)
}

func (r alarmRouter) updateAlarmRuleGroupBindings(ctx *gin.Context) (interface{}, error) {
	var req request.UpdateAlarmRuleGroupBindings
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.UpdateAlarmRuleGroupBindings(id, req)
}

func (r alarmRouter) importAlarmRuleGroups(ctx *gin.Context) (interface{}, error) {
	var req request.AlarmRuleGroupsImported
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, err
	}
	req.ProjectID = cast.ToUint(ctx.MustGet("project_id"))
	err := r.service.ImportAlarmRuleGroups(req)
	if err != nil {
		return nil, response.InvalidParameterErrorWithDetail(err.Error())
	} else {
		return nil, nil
	}
}

func (r alarmRouter) getAlarmRuleGroupsFile(ctx *gin.Context) (interface{}, error) {
	projectID := cast.ToUint(ctx.MustGet("project_id"))
	groupIDs := make([]uint, 0)
	param := ctx.Query("alarm_rule_group_ids")
	if len(param) > 0 {
		arr := strings.Split(param, ",")
		for _, item := range arr {
			groupIDs = append(groupIDs, cast.ToUint(item))
		}
	}

	return r.service.GetAlarmRuleGroupsExportFileWithFilters(projectID, groupIDs)
}
