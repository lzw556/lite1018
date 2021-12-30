package request

import (
	"io/ioutil"
	"mime/multipart"
)

type CreateAsset struct {
	Name     string                `form:"name"`
	Image    *multipart.FileHeader `form:"file"`
	ParentID uint                  `form:"parent_id"`
	Location *struct {
		X float32 `form:"x"`
		Y float32 `form:"y"`
	} `form:"location"`
}

func (a *CreateAsset) UploadBytes() ([]byte, error) {
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

type UpdateAsset struct {
	Name     string `json:"name"`
	ParentID uint   `json:"parent_id"`
	Location *struct {
		X float32 `json:"x"`
		Y float32 `json:"y"`
	} `json:"location"`
}
