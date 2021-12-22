package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type AlarmRecordAcknowledge struct {
	User      string `json:"user"`
	Note      string `json:"note"`
	Timestamp int64  `json:"timestamp"`
}

func NewAlarmRecordAcknowledge(e po.AlarmRecordAcknowledge) AlarmRecordAcknowledge {
	return AlarmRecordAcknowledge{
		Note:      e.Note,
		Timestamp: e.CreatedAt.UTC().Unix(),
	}
}

func (a *AlarmRecordAcknowledge) SetUser(e po.User) {
	a.User = e.Username
}
