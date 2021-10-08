package middleware

import (
	"embed"
	"github.com/gin-contrib/static"
	"io/fs"
	"net/http"
)

type embedFileSystem struct {
	http.FileSystem
}

func (e embedFileSystem) Exists(prefix string, path string) bool {
	_, err := e.Open(path)
	if err != nil {
		return false
	}
	return true
}

func EmbedFileSystem(fsEmbed embed.FS, targetPath string) static.ServeFileSystem {
	html, err := fs.Sub(fsEmbed, targetPath)
	if err != nil {
		panic(err)
	}
	return embedFileSystem{
		FileSystem: http.FS(html),
	}
}
