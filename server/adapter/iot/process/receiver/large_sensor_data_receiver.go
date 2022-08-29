package receiver

import (
	"github.com/allegro/bigcache/v3"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"sync"
)

type LargeSensorData struct {
	MetaLength int32  `json:"metaLength"`
	Payload    []byte `json:"payload"`
}

type LargeSensorDataSession map[int32]map[int32]LargeSensorData

var mu sync.RWMutex

func Receive(key string, m pd.LargeSensorDataMessage) {
	mu.Lock()
	defer mu.Unlock()
	sessions := LargeSensorDataSession{}
	err := cache.GetStruct(key, &sessions)
	if err == bigcache.ErrEntryNotFound {
		sessions = map[int32]map[int32]LargeSensorData{
			m.SessionId: {
				m.SegmentId: LargeSensorData{
					MetaLength: m.MetaLength,
					Payload:    m.Data,
				},
			},
		}
	} else {
		sessions[m.SessionId][m.SegmentId] = LargeSensorData{
			MetaLength: m.MetaLength,
			Payload:    m.Data,
		}
	}
	_ = cache.SetStruct(key, sessions)
}

func IsCompleted(key string, sessionID int32, segments int) (map[int32]LargeSensorData, bool) {
	mu.RLock()
	defer mu.RUnlock()
	sessions := LargeSensorDataSession{}
	err := cache.GetStruct(key, &sessions)
	if err == bigcache.ErrEntryNotFound {
		return nil, false
	}
	if len(sessions[sessionID]) == segments {
		return sessions[sessionID], true
	}
	return nil, false
}

func Get(key string, sessionID int32) map[int32]LargeSensorData {
	mu.RLock()
	defer mu.RUnlock()
	sessions := LargeSensorDataSession{}
	err := cache.GetStruct(key, &sessions)
	if err != nil {
		return nil
	}
	return sessions[sessionID]
}

func Clear(key string) {
	mu.RLock()
	defer mu.RUnlock()
	_ = cache.Delete(key)
}
