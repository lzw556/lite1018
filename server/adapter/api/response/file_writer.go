package response

import "github.com/gin-gonic/gin"

type FileWriter interface {
	FileName() string
	Write(writer gin.ResponseWriter) error
}
