package vo

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

type AlarmRuleGroupExported struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Category    uint   `json:"category"`
	Type        uint   `json:"type"`

	Rules []*AlarmRule `json:"rules"`
}

type AlarmRuleGroupsExported struct {
	ProjectID       uint                      `json:"projectId"`
	ProjectName     string                    `json:"projectName"`
	AlarmRuleGroups []*AlarmRuleGroupExported `json:"alarmRuleGroups"`
}

func (g AlarmRuleGroupsExported) FileName() string {
	return fmt.Sprintf("project_%s_alarmrules.json", g.ProjectName)
}

func (g AlarmRuleGroupsExported) Write(writer gin.ResponseWriter) error {
	bytes, err := json.Marshal(g)
	if err != nil {
		return err
	}
	_, err = writer.Write(bytes)
	return err
}
