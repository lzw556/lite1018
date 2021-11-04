package system

import (
	"github.com/gin-gonic/gin"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
)

func (r systemRouter) checkInit(ctx *gin.Context) (interface{}, error) {
	return nil, nil
}

func (r systemRouter) initSystem(ctx *gin.Context) (interface{}, error) {
	var req request.System
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.InitSystem(req)
}
