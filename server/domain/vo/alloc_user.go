package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type AllocUser struct {
	User        User `json:"user"`
	IsAllocated bool `json:"isAllocated"`
}

func NewAllocUser(e po.User) AllocUser {
	return AllocUser{
		User: NewUser(e),
	}
}
