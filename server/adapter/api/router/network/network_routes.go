package network

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
)

func (r networkRouter) importNetwork(ctx *gin.Context) (interface{}, error) {
	var req request.ImportNetwork
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.CreateNetwork(req)
}

func (r networkRouter) exportNetwork(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.ExportNetwork(id)
}

func (r networkRouter) getByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetNetwork(id)
}

func (r networkRouter) find(ctx *gin.Context) (interface{}, error) {
	assetID := cast.ToUint(ctx.Query("assetId"))
	return r.service.FindNetworks(assetID)
}

func (r networkRouter) accessDevices(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.AccessDevices
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.AccessDevices(id, req)
}

func (r networkRouter) removeDeviceByID(ctx *gin.Context) (interface{}, error) {
	networkID := cast.ToUint(ctx.Param("id"))
	deviceID := cast.ToUint(ctx.Param("deviceId"))
	return r.service.RemoveDevice(networkID, deviceID)
}

func (r networkRouter) updateSettingByGatewayID(ctx *gin.Context) (interface{}, error) {
	gatewayID := cast.ToUint(ctx.Query("gatewayId"))
	var req request.WSN
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.UpdateSetting(gatewayID, req)
}
