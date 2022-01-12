package alarm

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
)

func (r alarmRouter) createTemplate(ctx *gin.Context) (interface{}, error) {
	var req request.AlarmTemplate
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	req.ProjectID = cast.ToUint(ctx.MustGet("project_id"))
	return nil, r.service.CreateAlarmTemplate(req)
}

func (r alarmRouter) findTemplates(ctx *gin.Context) (interface{}, error) {
	filters := request.NewFilters(ctx.Request.URL.Query())
	filters = append(filters, request.Filter{
		Name:  "project_id",
		Value: ctx.MustGet("project_id"),
	})
	switch ctx.Query("method") {
	case "paging":
		page := cast.ToInt(ctx.Query("page"))
		size := cast.ToInt(ctx.Query("size"))
		result, total, err := r.service.FindAlarmTemplatesByPaginate(filters, page, size)
		if err != nil {
			return nil, err
		}
		return response.NewPageResult(page, size, total, result), nil
	default:
		return nil, nil
	}
}

func (r alarmRouter) getTemplate(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetAlarmTemplate(id)
}

func (r alarmRouter) updateTemplate(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.AlarmTemplate
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return r.service.UpdateAlarmTemplate(id, req)
}

func (r alarmRouter) deleteTemplate(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.RemoveAlarmTemplate(id)
}

func (r alarmRouter) checkAlarm(ctx *gin.Context) (interface{}, error) {
	name := ctx.Param("name")
	return nil, r.service.CheckAlarm(name)
}

func (r alarmRouter) createAlarm(ctx *gin.Context) (interface{}, error) {
	createType := cast.ToUint(ctx.Query("create_type"))
	switch createType {
	case 1:
		var req request.CreateAlarmFromTemplate
		if err := ctx.ShouldBindJSON(&req); err != nil {
			return nil, response.InvalidParameterError(err.Error())
		}
		return nil, r.service.CreateAlarmFromTemplate(req)
	default:
		var req request.CreateAlarm
		if err := ctx.ShouldBindJSON(&req); err != nil {
			return nil, response.InvalidParameterError(err.Error())
		}
		return nil, r.service.CreateAlarm(req)
	}
}

func (r alarmRouter) findAlarms(ctx *gin.Context) (interface{}, error) {
	switch ctx.Query("method") {
	case "paging":
		filters := request.NewFilters(ctx.Request.URL.Query())
		page := cast.ToInt(ctx.Query("page"))
		size := cast.ToInt(ctx.Query("size"))
		result, total, err := r.service.FindAlarmsByPaginate(filters, page, size)
		if err != nil {
			return nil, err
		}
		return response.NewPageResult(page, size, total, result), nil
	default:
		return nil, nil
	}
}

func (r alarmRouter) getAlarms(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetAlarmByID(id)
}

func (r alarmRouter) updateAlarm(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.UpdateAlarm
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.UpdateAlarmByID(id, req)
}

func (r alarmRouter) deleteAlarm(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.DeleteAlarmByID(id)
}

func (r alarmRouter) findRecords(ctx *gin.Context) (interface{}, error) {
	filters := request.NewFilters(ctx.Request.URL.Query())
	switch ctx.Query("method") {
	case "paging":
		page := cast.ToInt(ctx.Query("page"))
		size := cast.ToInt(ctx.Query("size"))
		from := cast.ToInt64(ctx.Query("from"))
		to := cast.ToInt64(ctx.Query("to"))
		result, total, err := r.service.FindAlarmRecordsByPaginate(filters, from, to, page, size)
		if err != nil {
			return nil, err
		}
		return response.NewPageResult(page, size, total, result), nil
	default:
		return nil, nil
	}
}

func (r alarmRouter) getRecord(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetAlarmRecordByID(id)
}

func (r alarmRouter) getRecordAcknowledge(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetAlarmRecordAcknowledgeByID(id)
}

func (r alarmRouter) deleteRecord(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.DeleteAlarmRecordByID(id)
}

func (r alarmRouter) acknowledgeRecord(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.AcknowledgeAlarmRecord
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	req.UserID = ctx.GetUint("user_id")
	return nil, r.service.AcknowledgeAlarmRecordByID(id, req)
}
