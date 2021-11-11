package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/pkg/utils"
)

type System struct {
	Server utils.Server `json:"server"`
	MQTT   struct {
		Username string `json:"username"`
		Password string `json:"password"`
		Address  string `json:"address"`
	} `json:"mqtt"`
	Database struct {
		FreePage      int `json:"freePage"`
		PendingPage   int `json:"pendingPage"`
		FreeAlloc     int `json:"freeAlloc"`
		FreelistInuse int `json:"freelistInuse"`
	} `json:"database"`
}
