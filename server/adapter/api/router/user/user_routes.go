package user

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
)

func (r userRouter) login(ctx *gin.Context) (interface{}, error) {
	var req request.Login
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return r.service.Login(req)
}

func (r userRouter) getByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return r.service.GetUserByID(id)
}

func (r userRouter) paging(ctx *gin.Context) (interface{}, error) {
	filters := request.NewFilters(ctx)
	switch ctx.Query("method") {
	case "paging":
		page := cast.ToInt(ctx.Query("page"))
		size := cast.ToInt(ctx.Query("size"))
		result, total, err := r.service.FindUsersByPaginate(page, size)
		if err != nil {
			return nil, err
		}
		return response.NewPageResult(page, size, total, result), nil
	default:
		return r.service.FilterUsers(filters)
	}
}

func (r userRouter) create(ctx *gin.Context) (interface{}, error) {
	var req request.User
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.CreateUser(req)
}

func (r userRouter) updateByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	var req request.User
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return r.service.UpdateUserByID(id, req)
}

func (r userRouter) removeByID(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.Param("id"))
	return nil, r.service.DeleteUserByID(id)
}

func (r userRouter) profile(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.MustGet("user_id"))
	return r.service.GetUserByID(id)
}

func (r userRouter) updateProfile(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.MustGet("user_id"))
	var req request.Profile
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return r.service.UpdateProfileByUserID(id, req)
}

func (r userRouter) updatePass(ctx *gin.Context) (interface{}, error) {
	id := cast.ToUint(ctx.MustGet("user_id"))
	var req request.UserPass
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, response.InvalidParameterError(err.Error())
	}
	return nil, r.service.UpdatePassByUserID(id, req)
}
