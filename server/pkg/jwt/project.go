package jwt

import "github.com/dgrijalva/jwt-go"

type ProjectClaims struct {
	ID     uint
	Scopes []string
	jwt.StandardClaims
}
