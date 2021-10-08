package request

type Login struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
}

type Profile map[string]string

type UserPass struct {
	Old string `json:"old"`
	New string `json:"new"`
}
