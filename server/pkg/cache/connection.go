package cache

import (
	"fmt"
	"github.com/spf13/cast"
	"strings"
	"sync"
	"time"
)

var connections map[string]string
var mu sync.RWMutex

func init() {
	connections = make(map[string]string)
}

func SetOnline(mac string) {
	mu.Lock()
	defer mu.Unlock()
	connections[mac] = fmt.Sprintf("online,%d", time.Now().Unix())
}

func SetOffline(mac string) {
	mu.Lock()
	defer mu.Unlock()
	connections[mac] = fmt.Sprintf("offline,%d", time.Now().Unix())
}

func SetConnection(mac string, isOnline bool) {
	if isOnline {
		SetOnline(mac)
	} else {
		SetOffline(mac)
	}
}

func BatchSetOnline(macs ...string) {
	mu.Lock()
	defer mu.Unlock()
	for _, mac := range macs {
		connections[mac] = fmt.Sprintf("online,%d", time.Now().Unix())
	}
}

func BatchSetOffline(macs ...string) {
	mu.Lock()
	defer mu.Unlock()
	for _, mac := range macs {
		connections[mac] = fmt.Sprintf("offline,%d", time.Now().Unix())
	}
}

func BatchDeleteConnections(macs ...string) {
	mu.Lock()
	defer mu.Unlock()
	for _, mac := range macs {
		delete(connections, mac)
	}
}

func GetConnection(mac string) (bool, int64, bool) {
	mu.RLock()
	defer mu.RUnlock()
	if c, ok := connections[mac]; ok {
		parts := strings.SplitN(c, ",", 2)
		if parts[0] == "online" {
			return true, cast.ToInt64(parts[1]), true
		}
		return false, cast.ToInt64(parts[1]), true
	}
	return false, 0, false
}
