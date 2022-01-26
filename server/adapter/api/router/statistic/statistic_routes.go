package statistic

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
)

func (r statisticRouter) statisticalMeasurements(ctx *gin.Context) (interface{}, error) {
	filters := request.NewFilters(ctx)
	return r.service.StatisticalMeasurements(filters)
}

func (r statisticRouter) statisticalMeasurementData(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.StatisticalMeasurementDataByID(id)
}

func (r statisticRouter) statisticalMeasurementAlert(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.StatisticalMeasurementAlertByID(id)
}

func (r statisticRouter) statisticalDevices(ctx *gin.Context) (interface{}, error) {
	filters := request.NewFilters(ctx)
	return r.service.StatisticalDevices(filters)
}

func (r statisticRouter) statisticalAlarmRecords(ctx *gin.Context) (interface{}, error) {
	filters := request.NewFilters(ctx)
	from := cast.ToInt64(ctx.Query("from"))
	to := cast.ToInt64(ctx.Query("to"))
	return r.service.StatisticalAlarmRecords(from, to, filters)
}
