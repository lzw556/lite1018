package property

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
)

func (r propertyRouter) find(ctx *gin.Context) (interface{}, error) {
	if ctx.Query("type") == "monitoring_point" {
		return r.service.FindMonitoringPointProperties(cast.ToUint(ctx.Query("monitoring_point_type")))
	} else {
		return r.service.FindPropertiesByDeviceType(cast.ToUint(ctx.Query("device_type")))
	}
}
