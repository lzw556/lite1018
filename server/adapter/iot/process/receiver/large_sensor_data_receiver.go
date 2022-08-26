package receiver

import (
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"sync"
)

var receiver map[string]map[int32]pd.LargeSensorDataMessage
var mu sync.RWMutex

func init() {
	receiver = make(map[string]map[int32]pd.LargeSensorDataMessage)
}

func Receive(key string, m pd.LargeSensorDataMessage) {
	mu.Lock()
	defer mu.Unlock()
	if _, ok := receiver[key]; !ok {
		receiver[key] = map[int32]pd.LargeSensorDataMessage{}
	}
	receiver[key][m.SegmentId] = m
}

func IsCompleted(key string, segments int) bool {
	mu.RLock()
	defer mu.RUnlock()
	return len(receiver[key]) == segments
}

func Get(key string) map[int32]pd.LargeSensorDataMessage {
	mu.RLock()
	defer mu.RUnlock()
	return receiver[key]
}

func Clear(key string) {
	mu.RLock()
	defer mu.RUnlock()
	delete(receiver, key)
}
