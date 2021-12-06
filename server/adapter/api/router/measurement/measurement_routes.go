package measurement

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurement"
)

func (r measurementRouter) getMeasurementTypeParameters(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	result, err := measurement.GetParameters(measurement.Type(id))
	if err != nil {
		return nil, response.BusinessErr(err.(errcode.BusinessErrorCode), "")
	}
	return result, nil
}
