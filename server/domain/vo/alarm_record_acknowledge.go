package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type AlarmRecordAcknowledge struct {
	User      string `json:"user"`
	Note      string `json:"note"`
	Timestamp int64  `json:"timestamp"`
}

func NewAlarmRecordAcknowledge(e entity.AlarmRecordAcknowledge) AlarmRecordAcknowledge {
	return AlarmRecordAcknowledge{
		Note:      e.Note,
		Timestamp: e.CreatedAt.UTC().Unix(),
	}
}

func (a *AlarmRecordAcknowledge) SetUser(e entity.User) {
	a.User = e.Username
}
