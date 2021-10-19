package property

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
)

func (r propertyRouter) find(ctx *gin.Context) (interface{}, error) {
	deviceType := cast.ToUint(ctx.Query("device_type"))
	return r.service.FindProperties(deviceType)
}
