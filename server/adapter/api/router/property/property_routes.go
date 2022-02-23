package property

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
)

func (r propertyRouter) find(ctx *gin.Context) (interface{}, error) {
	return r.service.FindPropertiesByDeviceType(cast.ToUint(ctx.Query("device_type")))
}
