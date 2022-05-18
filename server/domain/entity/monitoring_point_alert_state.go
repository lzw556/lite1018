package entity

type MonitoringPointAlertState struct {
  Rule struct {
    ID     uint            `json:"id"`
    Name   string          `json:"name"`
    Metric AlarmRuleMetric `json:"metric"`
    Level  uint8           `json:"level"`
  } `json:"rule"`
  Record struct {
    ID    uint        `json:"id"`
    Value interface{} `json:"value"`
  } `json:"record"`
}

func (MonitoringPointAlertState) BucketName() string {
  return "ts_monitoring_point_alert_state"
}

func (state *MonitoringPointAlertState) SetRule(e AlarmRule) {
  state.Rule.ID = e.ID
  state.Rule.Name = e.Name
  state.Rule.Metric = e.Metric
  state.Rule.Level = e.Level
}

func (state *MonitoringPointAlertState) SetRecord(e AlarmRecord) {
  state.Record.ID = e.ID
  state.Record.Value = e.Value
}
