package request

type Permission struct {
	Path        string `json:"path"`
	Method      string `json:"method"`
	Description string `json:"description"`
	Group       string `json:"group"`
}
