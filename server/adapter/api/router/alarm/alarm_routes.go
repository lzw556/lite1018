package alarm

import (
	"github.com/gin-gonic/gin"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
)

func (r alarmRouter) createAlarm(ctx *gin.Context) (interface{}, error) {
	var req request.CreateAlarm
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.CreateAlarm(req)
}
