package request

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"io/ioutil"
	"mime/multipart"
	"strings"
)

type Firmware struct {
	Name      string
	ProductID int32
	Version   uint8
	Minor     uint8
	Major     uint8
	Size      int32
	Crc       string
	BuildTime uint32
	Payload   []byte
}

func (f *Firmware) Read(file *multipart.FileHeader) error {
	if !strings.HasSuffix(file.Filename, ".bin") {
		return response.BusinessErr(errcode.FirmwareFormatError, "")
	}
	f.Name = file.Filename
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()
	f.Payload, err = ioutil.ReadAll(src)
	if err != nil {
		return err
	}
	if len(f.Payload) < 532 {
		return response.BusinessErr(errcode.FirmwareFormatError, "")
	}
	f.Size = int32(len(f.Payload))
	return f.decode(f.Payload[512:])
}

func (f *Firmware) decode(buf []byte) error {
	if err := binary.Read(bytes.NewBuffer(buf[:4]), binary.LittleEndian, &f.ProductID); err != nil {
		return response.BusinessErr(errcode.FirmwareFormatError, "")
	}
	f.Version = buf[4]
	f.Minor = buf[5]
	f.Major = buf[6]
	f.Crc = fmt.Sprintf("%x%x%x%x", buf[15], buf[14], buf[13], buf[12])
	if err := binary.Read(bytes.NewBuffer(buf[16:20]), binary.LittleEndian, &f.BuildTime); err != nil {
		return response.BusinessErr(errcode.FirmwareFormatError, "")
	}
	return nil
}
