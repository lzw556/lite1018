package request

import (
	"github.com/gin-gonic/gin"
)

type Filter struct {
	Name  string      `json:"name"`
	Value interface{} `json:"value"`
}

type Filters map[string]interface{}

func NewFilters(ctx *gin.Context) Filters {
	filters := make(Filters)
	for k, v := range ctx.Request.URL.Query() {
		if len(v) == 1 {
			filters[k] = v[0]
		} else {
			filters[k] = v
		}
	}
	if projectID, ok := ctx.Get("project_id"); ok {
		filters["project_id"] = projectID
	}
	filters["timezone"] = ctx.GetHeader("Timezone")
	return filters
}
