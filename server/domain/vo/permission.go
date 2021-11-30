package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type Permission struct {
	ID          uint   `json:"id"`
	Path        string `json:"path"`
	Method      string `json:"method"`
	Description string `json:"description"`
	Group       string `json:"group"`
}

func NewPermission(e po.Permission) Permission {
	return Permission{
		ID:          e.ID,
		Path:        e.Path,
		Method:      e.Method,
		Description: e.Description,
		Group:       e.Group,
	}
}
