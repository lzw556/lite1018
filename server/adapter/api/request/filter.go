package request

import (
	"github.com/gin-gonic/gin"
)

type Filter struct {
	Name  string      `json:"name"`
	Value interface{} `json:"value"`
}

type Filters []Filter

func NewFilters(ctx *gin.Context) Filters {
	filters := make(Filters, 0)
	for k, v := range ctx.Request.URL.Query() {
		if len(v) == 1 {
			filters = append(filters, Filter{Name: k, Value: v[0]})
		} else {
			filters = append(filters, Filter{Name: k, Value: v})
		}
	}
	if projectID, ok := ctx.Get("project_id"); ok {
		filters = append(filters, Filter{
			Name:  "project_id",
			Value: projectID,
		})
	}
	return filters
}
