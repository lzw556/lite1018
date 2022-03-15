package request

type Login struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type User struct {
	Username string `json:"username" binding:"required,min=4,max=16,alphanum"`
	Password string `json:"password" binding:"required,min=6,max=16"`
	Email    string `json:"email,omitempty"`
	Phone    string `json:"phone,omitempty"`
	Role     uint   `json:"role"`
}

type Profile map[string]string

type UserPass struct {
	Old string `json:"old"`
	New string `json:"new"`
}
