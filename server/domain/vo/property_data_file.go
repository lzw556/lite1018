package vo

import (
	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
)

type PropertyDataFile struct {
	Name string         `json:"name"`
	File *excelize.File `json:"file"`
}

func (f *PropertyDataFile) FileName() string {
	return f.Name
}

func (f *PropertyDataFile) Write(writer gin.ResponseWriter) error {
	return f.File.Write(writer)
}
