package firmware

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
)

func (r firmwareRouter) create(ctx *gin.Context) (interface{}, error) {
	file, err := ctx.FormFile("file")
	if err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	var req request.Firmware
	if err := req.Read(file); err != nil {
		return nil, err
	}
	return nil, r.service.CreateFirmware(req)
}

func (r firmwareRouter) paging(ctx *gin.Context) (interface{}, error) {
	page := cast.ToInt(ctx.Query("page"))
	size := cast.ToInt(ctx.Query("size"))
	result, total, err := r.service.FindFirmwaresByPaginate(page, size)
	if err != nil {
		return nil, err
	}
	return response.NewPageResult(page, size, total, result), nil
}

func (r firmwareRouter) removeByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.RemoveFirmware(id)
}
