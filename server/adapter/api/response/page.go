package response

type PageResult struct {
	Size   int         `json:"size"`
	Page   int         `json:"page"`
	Total  int64       `json:"total"`
	Result interface{} `json:"result"`
}

func NewPageResult(page, size int, total int64, result interface{}) PageResult {
	return PageResult{
		Page:   page,
		Size:   size,
		Total:  total,
		Result: result,
	}
}
