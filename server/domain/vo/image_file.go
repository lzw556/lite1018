package vo

import "github.com/gin-gonic/gin"

type ImageFile struct {
	Bytes []byte
}

func (image ImageFile) FileName() string {
	return "image"
}

func (image ImageFile) Write(writer gin.ResponseWriter) error {
	_, err := writer.Write(image.Bytes)
	return err
}
