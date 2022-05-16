package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type AccessToken struct {
	User  User   `json:"user"`
	Token string `json:"token"`
}

func NewAccessToken(token string) AccessToken {
	return AccessToken{
		Token: token,
	}
}

func (a *AccessToken) SetUser(e entity.User) {
	a.User = NewUser(e)
}
