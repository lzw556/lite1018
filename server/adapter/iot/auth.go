package iot

type Auth struct {
	Username string
	Password string
}

func (a Auth) Authenticate(user, password []byte) bool {
	return a.Username == string(user) && a.Password == string(password)
}

func (a Auth) ACL(user []byte, topic string, write bool) bool {
	return true
}
