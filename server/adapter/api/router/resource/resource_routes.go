package resource

import (
	"github.com/gin-gonic/gin"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/global"
)

func (r resourceRouter) getAsset(ctx *gin.Context) (interface{}, error) {
	name := ctx.Param("name")
	payload, err := global.ReadFile("resources/assets", name)
	if err != nil {
		return nil, err
	}
	return &vo.ImageFile{
		Bytes: payload,
	}, nil
}
