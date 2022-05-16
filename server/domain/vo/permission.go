package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type Permission struct {
	ID          uint   `json:"id"`
	Path        string `json:"path"`
	Method      string `json:"method"`
	Description string `json:"description"`
	Group       string `json:"group"`
}

func NewPermission(e entity.Permission) Permission {
	return Permission{
		ID:          e.ID,
		Path:        e.Path,
		Method:      e.Method,
		Description: e.Description,
		Group:       e.Group,
	}
}
