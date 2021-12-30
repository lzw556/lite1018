package vo

import (
	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
)

type ExcelFile struct {
	Name string         `json:"name"`
	File *excelize.File `json:"file"`
}

func (f *ExcelFile) FileName() string {
	return f.Name
}

func (f *ExcelFile) Write(writer gin.ResponseWriter) error {
	return f.File.Write(writer)
}
