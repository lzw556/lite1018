package global

import (
	"bytes"
	"context"
	"fmt"
	"github.com/spf13/viper"
	"go.etcd.io/bbolt"
	"gorm.io/gorm"
	"io"
	"os"
)

var (
	Viper  *viper.Viper
	DB     *gorm.DB
	BoltDB *bbolt.DB
)

func GetDB(ctx context.Context) *gorm.DB {
	return DB.WithContext(ctx)
}

func SaveFile(name string, path string, payload []byte) error {
	_, err := os.Stat(path)
	if os.IsNotExist(err) {
		if err := os.MkdirAll(path, os.ModePerm); err != nil {
			return err
		}
	}
	out, err := os.Create(fmt.Sprintf("%s/%s", path, name))
	if err != nil {
		fmt.Println(err)
		return err
	}
	defer out.Close()
	reader := bytes.NewReader(payload)
	_, err = io.Copy(out, reader)
	return err
}

func DeleteFile(path string, filename string) error {
	return os.Remove(fmt.Sprintf("%s/%s", path, filename))
}
