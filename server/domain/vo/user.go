package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type User struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Role     uint   `json:"role"`
}

func NewUser(e po.User) User {
	return User{
		ID:       e.ID,
		Username: e.Username,
		Email:    e.Email,
		Phone:    e.Phone,
		Role:     e.RoleID,
	}
}
