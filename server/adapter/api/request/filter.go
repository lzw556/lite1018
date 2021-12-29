package request

import "net/url"

type Filter struct {
	Name  string      `json:"name"`
	Value interface{} `json:"value"`
}

type Filters []Filter

func NewFilters(values url.Values) Filters {
	filters := make(Filters, 0)
	for k, v := range values {
		if len(v) == 1 {
			filters = append(filters, Filter{Name: k, Value: v[0]})
		} else {
			filters = append(filters, Filter{Name: k, Value: v})
		}
	}
	return filters
}
