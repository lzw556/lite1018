package system

import "github.com/gin-gonic/gin"

func (r systemRouter) get(_ *gin.Context) (interface{}, error) {
	return r.service.GetSystem()
}

func (r systemRouter) reboot(_ *gin.Context) (interface{}, error) {
	return nil, r.service.Reboot()
}
