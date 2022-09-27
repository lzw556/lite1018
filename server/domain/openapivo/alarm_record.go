package openapivo

type AlarmRecord struct {
  ID                 uint                   `json:"id"`
  AlarmRuleGroupName string                 `json:"alarmRuleGroupName"`
  AlarmRuleGroupID   uint                   `json:"alarmRuleGroupId"`
  Metric             entity.AlarmRuleMetric `json:"metric"`
  Source             struct {
    ID uint `json:id`
  } `json:"source"`
  Operation    string  `json:"operation"`
  Level        uint8   `json:"level"`
  Value        float64 `json:"value"`
  Threshold    float64 `json:"threshold"`
  Status       uint    `json:"status"`
  Acknowledged bool    `json:"acknowledged"`
  Category     uint8   `json:"category"`
  CreatedAt    int64   `json:"createdAt"`
}
