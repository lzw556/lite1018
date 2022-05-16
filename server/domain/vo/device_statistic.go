package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/entity"

type DeviceStatistic struct {
	IsOnline   bool `json:"isOnline"`
	AlertLevel int  `json:"alertLevel"`
}

func (s *DeviceStatistic) SetAlertState(states []entity.DeviceAlertState) {
	s.AlertLevel = 0
	for _, state := range states {
		if int(state.Rule.Level) > s.AlertLevel {
			s.AlertLevel = int(state.Rule.Level)
			if s.AlertLevel >= 3 {
				break
			}
		}
	}
}
