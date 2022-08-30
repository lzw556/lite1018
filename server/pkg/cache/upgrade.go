package cache

import "sync"

type UpgradeCache struct {
	FirmwareSize int32 `json:"firmwareSize"`
	Packets      map[string][]byte
}

var upgrade map[string]*UpgradeCache
var umu sync.RWMutex

func init() {
	upgrade = make(map[string]*UpgradeCache)
}

func SetFirmware(key string, c *UpgradeCache) {
	umu.Lock()
	defer umu.Unlock()
	upgrade[key] = c
}

func GetFirmware(key string) *UpgradeCache {
	return upgrade[key]
}

func ClearFirmware(key string) {
	umu.Lock()
	defer umu.Unlock()
	delete(upgrade, key)
}
