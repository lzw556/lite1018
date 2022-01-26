package request

import (
	"fmt"
	"io/ioutil"
	"mime/multipart"
	"path"
)

type Asset struct {
	Name      string                `form:"name"`
	Image     *multipart.FileHeader `form:"file"`
	ParentID  uint                  `form:"parent_id"`
	ProjectID uint                  `json:"project_id"`
	Location  *struct {
		X float32 `form:"x"`
		Y float32 `form:"y"`
	} `form:"location"`
}

func (a *Asset) UploadBytes() ([]byte, error) {
	if a.Image == nil {
		return nil, nil
	}
	src, err := a.Image.Open()
	if err != nil {
		return nil, err
	}
	defer src.Close()
	payload, err := ioutil.ReadAll(src)
	if err != nil {
		return nil, err
	}
	return payload, nil
}

func (a *Asset) CheckFileSize() bool {
	if a.Image != nil {
		fmt.Println(a.Image.Size)
		return a.Image.Size > 2<<20 // 2MB
	}
	return false
}

func (a *Asset) GetFileExt() string {
	return path.Ext(a.Image.Filename)
}
