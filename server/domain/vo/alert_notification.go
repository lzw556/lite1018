package vo

import (
	"bytes"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
	"text/template"
)

const DefaultAlertNotificationTmpl = `
设备【{{.Device}}】的【{{.Field}}】值{{.Operation}}设定的阈值{{.Threshold}}，当前值为{{.Value}}
`

const DefaultRecoveryNotificationTmpl = `
设备【{{.Device}}】的【{{.Field}}】值恢复正常，当前值为{{.Value}}
`

type AlertNotification struct {
	Title    string `json:"title"`
	Template string `json:"template"`
}

func NewAlertNotification(title, template string) AlertNotification {
	return AlertNotification{
		Title:    title,
		Template: template,
	}
}

func (n AlertNotification) Notify(message AlertMessage, level uint, sourceID uint) error {
	t, err := template.New("alert_notify").Parse(n.Template)
	if err != nil {
		return err
	}
	var buf bytes.Buffer
	if err := t.Execute(&buf, message); err != nil {
		return err
	}
	eventbus.Publish(eventbus.SocketEmit, "socket::alertNotification", map[string]interface{}{
		"title":    n.Title,
		"message":  buf.String(),
		"level":    level,
		"sourceId": sourceID,
	})
	return nil
}
