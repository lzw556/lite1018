package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type AccessToken struct {
	User  User   `json:"user"`
	Token string `json:"token"`
}

func NewAccessToken(token string) AccessToken {
	return AccessToken{
		Token: token,
	}
}

func (a *AccessToken) SetUser(e po.User) {
	a.User = NewUser(e)
}
