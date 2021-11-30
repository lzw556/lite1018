package jwt

import (
	jwt "github.com/dgrijalva/jwt-go"
	"strconv"
)

var secretKey = []byte("tiny-iot-server")

type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	RoleID   string `json:"role_id"`
	jwt.StandardClaims
}

func GenerateToken(userID uint, username string, roleID uint) (string, error) {
	claims := Claims{
		UserID:   userID,
		Username: username,
		RoleID:   strconv.Itoa(int(roleID)),
	}
	claims.Issuer = "tiny-iot"

	tokenClaims := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	token, err := tokenClaims.SignedString(secretKey)
	if err != nil {
		return "", err
	}
	return token, nil
}

func ParseToken(token string) (*Claims, error) {
	tokenClaims, err := jwt.ParseWithClaims(token, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return secretKey, nil
	})
	if err != nil {
		return nil, err
	}
	if tokenClaims != nil {
		if claims, ok := tokenClaims.Claims.(*Claims); ok && tokenClaims.Valid {
			return claims, nil
		}
	}
	return nil, err
}
