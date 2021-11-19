package entity

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type AlarmRecord struct {
	po.AlarmRecord
}

func (r *AlarmRecord) Acknowledge() {
	r.Acknowledged = true
	r.Status = po.AlarmRecordStatusResolved
}

type AlarmRecords []AlarmRecord
