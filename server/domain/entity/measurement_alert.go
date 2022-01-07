package entity

type AlertRecord struct {
	ID    uint `json:"id"`
	Level uint `json:"level"`
}

type MeasurementAlert struct {
	ID      uint                 `json:"id"`
	Records map[uint]AlertRecord `json:"records"`
}

func (MeasurementAlert) BucketName() string {
	return "ts_measurement_alert"
}

func (m MeasurementAlert) Level(id uint) uint {
	return m.Records[id].Level
}

func (m *MeasurementAlert) RemoveAlarmRecord(id uint) {
	delete(m.Records, id)
}

func (m MeasurementAlert) MeasurementStatus() uint {
	status := uint(0)
	for _, record := range m.Records {
		if record.Level > status {
			status = record.Level
		}
	}
	return status
}
