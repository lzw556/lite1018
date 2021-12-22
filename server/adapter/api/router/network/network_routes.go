package network

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
)

func (r networkRouter) create(ctx *gin.Context) (interface{}, error) {
	var req request.CreateNetwork
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.CreateNetwork(req)
}

func (r networkRouter) importNetwork(ctx *gin.Context) (interface{}, error) {
	var req request.ImportNetwork
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.ImportNetwork(req)
}

func (r networkRouter) exportNetwork(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.ExportNetwork(id)
}

func (r networkRouter) getByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetNetwork(id)
}

func (r networkRouter) sync(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.SyncNetwork(id)
}

func (r networkRouter) find(ctx *gin.Context) (interface{}, error) {
	filters := request.NewFilters(ctx.Request.URL.Query())
	switch ctx.Query("method") {
	case "paging":
		page := cast.ToInt(ctx.Query("page"))
		size := cast.ToInt(ctx.Query("size"))
		result, total, err := r.service.FindNetworksByPaginate(filters, page, size)
		if err != nil {
			return nil, err
		}
		return response.NewPageResult(page, size, total, result), nil
	default:
		return nil, nil
	}
}

func (r networkRouter) accessDevices(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.AccessDevices
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.AccessDevices(id, req)
}

func (r networkRouter) removeDevices(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.RemoveDevices
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.RemoveDevices(id, req)
}

func (r networkRouter) updateSettingByGatewayID(ctx *gin.Context) (interface{}, error) {
	gatewayID := cast.ToUint(ctx.Query("gatewayId"))
	var req request.WSN
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.UpdateSetting(gatewayID, req)
}

func (r networkRouter) updateByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.Network
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return r.service.UpdateNetwork(id, req)
}

func (r networkRouter) deleteByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.RemoveNetwork(id)
}
