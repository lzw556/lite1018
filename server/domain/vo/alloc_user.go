package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type AllocUser struct {
	User        User `json:"user"`
	IsAllocated bool `json:"isAllocated"`
}

func NewAllocUser(e entity.User) AllocUser {
	return AllocUser{
		User: NewUser(e),
	}
}
