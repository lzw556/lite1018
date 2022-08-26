package process

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"time"
)

type PullFirmware struct {
}

func NewPullFirmware() Processor {
	return newRoot(&PullFirmware{})
}

func (p PullFirmware) Name() string {
	return "PullFirmware"
}

func (p PullFirmware) Next() Processor {
	return nil
}

func (p PullFirmware) Process(ctx *iot.Context, msg iot.Message) error {
	if value, ok := ctx.Get(msg.Body.Device); ok {
		if device, ok := value.(entity.Device); ok {
			m := &pd.PullFirmwareMessage{}
			if err := m.Unmarshal(msg.Body.Payload); err != nil {
				return err
			}

			var (
				retry    int
				firmware *cache.UpgradeCache
			)
			for retry < 3 {
				xlog.Infof("[%s] try to get firmware [%s] retry times [%d]", msg.Body.Device, m.Crc, retry+1)
				firmware = cache.GetFirmware(fmt.Sprintf("%s_%s", msg.Body.Device, m.Crc))
				if firmware != nil {
					if part, ok := firmware.Packets[fmt.Sprintf("%d", m.SeqId)]; ok {
						cmd := command.NewPullFirmwareResponseCmd(m.SeqId, firmware.FirmwareSize, part)
						err := cmd.ExecuteAsync(msg.Body.Gateway, msg.Body.Device, false)
						if err != nil {
							return err
						}
						total := len(firmware.Packets)
						progress := float32(m.SeqId+1) / float32(total) * 100
						device.UpdateDeviceUpgradeStatus(entity.DeviceUpgradeLoading, progress)
						if progress == 100 {
							cache.ClearFirmware(fmt.Sprintf("%s_%s", msg.Body.Device, m.Crc))
						}
					}
					break
				}
				retry += 1
				time.Sleep(1 * time.Second)
			}
			if retry >= 3 {
				return fmt.Errorf("[%s] not found firmware in cache", msg.Body.Device)
			}
		}
	}
	return nil
}
