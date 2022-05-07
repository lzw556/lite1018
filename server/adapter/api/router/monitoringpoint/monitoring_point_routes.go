package monitoringpoint

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
)

func (r monitoringPointRouter) create(ctx *gin.Context) (interface{}, error) {
	var req request.CreateMonitoringPoint
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}

	req.ProjectID = cast.ToUint(ctx.MustGet("project_id"))
	return nil, r.service.CreateMonitoringPoint(req)
}
