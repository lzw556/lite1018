package middleware

import (
	"github.com/gin-gonic/gin"
	"strings"
)

type Middleware interface {
	WrapHandler() gin.HandlerFunc
}

func pathMatch(path string, exclusion string) bool {
	if exclusion == "*" {
		return true
	}
	// remove request path prefix "api/"
	path = strings.TrimPrefix(path, "api/")
	i := strings.Index(exclusion, "*")
	if i <= 0 {
		return path == exclusion
	}
	if len(path) < i {
		if strings.HasSuffix(exclusion[:i], "/") {
			return exclusion[:i-1] == path
		}
		if strings.HasPrefix(exclusion[:i], "/") {
			return exclusion[1:i] == path
		}
		return exclusion[:i] == path
	}
	return exclusion[:i] == path[:i]
}
