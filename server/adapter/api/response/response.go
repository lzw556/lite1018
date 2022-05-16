package response

import (
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"net/http"
	"net/url"

	"github.com/gin-gonic/gin"
)

type Result struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data,omitempty"`
}

func SuccessResponse(data interface{}) Result {
	return Result{
		Code: http.StatusOK,
		Data: data,
	}
}

func Success(ctx *gin.Context, data interface{}) {
	ctx.JSON(http.StatusOK, Result{
		Code: http.StatusOK,
		Data: data,
	})
}

func SuccessWithBusinessError(ctx *gin.Context, err BusinessError) {
	ctx.JSON(http.StatusOK, Result{
		Code: int(err.Code),
		Msg:  errcode.GetErrMessage(err.Code),
		Data: err.Reason,
	})
}

func Redirect(ctx *gin.Context, err BusinessError) {
	ctx.JSON(http.StatusTemporaryRedirect, Result{
		Code: int(err.Code),
		Msg:  errcode.GetErrMessage(err.Code),
		Data: err.Reason,
	})
}

func BadRequest(ctx *gin.Context, msg string, err error) {
	ctx.JSON(http.StatusBadRequest, Result{
		Code: http.StatusBadRequest,
		Msg:  msg,
		Data: err,
	})
}

func InternalServerError(ctx *gin.Context, err error) {
	ctx.JSON(http.StatusInternalServerError, err)
}

func NotFound(ctx *gin.Context, err error) {
	ctx.JSON(http.StatusOK, Result{
		Code: http.StatusNotFound,
		Data: err,
	})
}

func UnauthorizedWithError(ctx *gin.Context, err error) {
	ctx.JSON(http.StatusUnauthorized, Result{
		Code: http.StatusUnauthorized,
		Data: err,
	})
}

func Unauthorized(ctx *gin.Context) {
	ctx.JSON(http.StatusUnauthorized, Result{
		Code: http.StatusUnauthorized,
	})
}

func Forbidden(ctx *gin.Context, err error) {
	ctx.JSON(http.StatusForbidden, Result{
		Code: http.StatusForbidden,
		Data: err,
	})
}

func WriteFile(ctx *gin.Context, writer FileWriter) {
	ctx.Header("Content-TypeID", "application/octet-stream")
	ctx.Header("Content-Disposition", "attachment; filename="+url.QueryEscape(writer.FileName()))
	ctx.Header("Content-Transfer-Encoding", "binary")
	if err := writer.Write(ctx.Writer); err != nil {
		BadRequest(ctx, "操作失败", err)
	}
}

func WriteBytes(ctx *gin.Context, filename string, bytes []byte) {
	ctx.Header("Content-TypeID", "application/octet-stream")
	ctx.Header("Content-Disposition", "attachment; filename="+url.QueryEscape(filename))
	ctx.Header("Content-Transfer-Encoding", "binary")
	if _, err := ctx.Writer.Write(bytes); err != nil {
		BadRequest(ctx, "操作失败", err)
	}
}
