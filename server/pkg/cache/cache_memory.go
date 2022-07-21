package cache

import (
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"sync"
	"time"

	"github.com/allegro/bigcache/v3"
)

var cache *bigcache.BigCache
var once sync.Once
var config = bigcache.Config{
	Shards:             256,
	LifeWindow:         10 * time.Minute,
	CleanWindow:        0,
	MaxEntriesInWindow: 1000 * 10 * 60,
	MaxEntrySize:       10485760, // 10MB
	Verbose:            true,
	HardMaxCacheSize:   8192, // 2GB
	OnRemoveWithReason: func(key string, entry []byte, reason bigcache.RemoveReason) {
		xlog.Infof("[%s] removed from cache size [%d] reason [%v]", key, len(entry), reason)
	},
}

func Init(mode string) {
	once.Do(func() {
		switch mode {
		case "debug":
			config.Verbose = true
		default:
			config.Verbose = false
		}
		var err error
		cache, err = bigcache.NewBigCache(config)
		if err != nil {
			panic(err)
		}
	})
}

func Get(key string) ([]byte, error) {
	return cache.Get(key)
}

func GetStruct(key string, v interface{}) error {
	bytes, err := Get(key)
	if err != nil {
		return err
	}
	return json.Unmarshal(bytes, v)
}

func Set(key string, value []byte) error {
	return cache.Set(key, value)
}

func SetStruct(key string, v interface{}) error {
	bytes, err := json.Marshal(v)
	if err != nil {
		return err
	}
	return Set(key, bytes)
}

func Append(key string, value []byte) error {
	return cache.Append(key, value)
}

func Delete(key string) error {
	return cache.Delete(key)
}

func Reset() error {
	return cache.Reset()
}
