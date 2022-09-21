package statistic

import (
	"github.com/gin-gonic/gin"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
)

func (r statisticRouter) getDeviceStatistics(ctx *gin.Context) (interface{}, error) {
	filters := request.NewFilters(ctx)
	return r.service.GetDeviceStatistics(filters)
}

func (r statisticRouter) getAlertStatistics(ctx *gin.Context) (interface{}, error) {
	filters := request.NewFilters(ctx)
	return r.service.GetAlertStatistics(filters)
}

func (r statisticRouter) getAllStatistics(ctx *gin.Context) (interface{}, error) {
	filters := request.NewFilters(ctx)
	return r.service.GetAllStatistics(filters)
}
