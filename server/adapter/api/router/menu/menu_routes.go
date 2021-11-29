package menu

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
)

func (r menuRouter) myMenus(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.MustGet("user_id"))
	return r.service.GetMenusByUserID(id)
}

func (r menuRouter) tree(ctx *gin.Context) (interface{}, error) {
	return r.service.GetMenusTree()
}
