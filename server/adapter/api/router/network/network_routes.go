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
	req.ProjectID = cast.ToUint(ctx.MustGet("project_id"))
	return nil, r.service.CreateNetwork(req)
}

func (r networkRouter) importNetwork(ctx *gin.Context) (interface{}, error) {
	var req request.ImportNetwork
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	req.ProjectID = cast.ToUint(ctx.MustGet("project_id"))
	return nil, r.service.ImportNetwork(req)
}

func (r networkRouter) exportNetwork(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.ExportNetworkByID(id)
}

func (r networkRouter) get(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetNetworkByID(id)
}

func (r networkRouter) sync(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.SyncNetworkByID(id)
}

func (r networkRouter) find(ctx *gin.Context) (interface{}, error) {
	filters := request.NewFilters(ctx)
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
		return r.service.FilterNetworks(filters)
	}
}

func (r networkRouter) addDevices(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.AddDevices
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.AddDevicesByID(id, req)
}

func (r networkRouter) removeDevices(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.RemoveDevices
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.RemoveDevicesByID(id, req)
}

func (r networkRouter) update(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.Network
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	req.ProjectID = cast.ToUint(ctx.MustGet("project_id"))
	return r.service.UpdateNetworkByID(id, req)
}

func (r networkRouter) delete(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.DeleteNetworkByID(id)
}
