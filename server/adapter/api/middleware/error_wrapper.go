package middleware

import "github.com/gin-gonic/gin"

type ErrorWrapperHandler func(ctx *gin.Context) (interface{}, error)
