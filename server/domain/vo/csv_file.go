package vo

import (
	"encoding/csv"
	"github.com/gin-gonic/gin"
)

type CsvFile struct {
	Name  string     `json:"name"`
	Title []string   `json:"title"`
	Data  [][]string `json:"data"`
}

func (f *CsvFile) FileName() string {
	return f.Name
}

func (f *CsvFile) Write(writer gin.ResponseWriter) error {
	w := csv.NewWriter(writer)
	if err := w.Write(f.Title); err != nil {
		return err
	}
	for _, d := range f.Data {
		if err := w.Write(d); err != nil {
			return err
		}
	}
	w.Flush()
	return nil
}
