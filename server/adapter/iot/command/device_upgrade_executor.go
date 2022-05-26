package command

import (
	"context"
	"fmt"
	mqtt2 "github.com/eclipse/paho.mqtt.golang"
	"github.com/gogo/protobuf/proto"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/background"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/global"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"time"
)

type DeviceUpgradeExecutor struct {
	firmware  entity.Firmware
	eventRepo dependency.EventRepository
}

func NewDeviceUpgradeExecutor(firmware entity.Firmware) background.Executor {
	return DeviceUpgradeExecutor{
		firmware:  firmware,
		eventRepo: repository.Event{},
	}
}

func (e DeviceUpgradeExecutor) Execute(ctx context.Context, gateway, device entity.Device) error {
	cmd := newUpgradeFirmwareCmd(e.firmware)
	resp, err := cmd.Execute(gateway.MacAddress, device.MacAddress)
	if err != nil {
		return err
	}
	xlog.Infof("start device upgrade job => [%s]", device.MacAddress)
	if resp.Code == 1 {
		if err := e.loadFirmware(ctx, gateway.MacAddress, device); err != nil {
			return err
		}
	}
	code := e.upgrade(ctx, gateway.MacAddress, device)
	e.addEvent(device, code)
	if code != 0 {
		return err
	}

	if device.MacAddress == gateway.MacAddress {
		if queue := background.GetTaskQueue(gateway.MacAddress); queue != nil {
			queue.Stop()
		}
	}
	device.UpdateDeviceUpgradeStatus(entity.DeviceUpgradeSuccess, 100)
	xlog.Infof("device upgrade successful => [%s]", device.MacAddress)
	return nil
}

func (e DeviceUpgradeExecutor) addEvent(device entity.Device, code int) {
	event := entity.Event{
		Code:      entity.EventCodeUpgrade,
		Category:  entity.EventCategoryDevice,
		SourceID:  device.ID,
		Timestamp: time.Now().UTC().Unix(),
		ProjectID: device.ProjectID,
		Content:   fmt.Sprintf(`{"code":%d}`, code),
	}
	_ = e.eventRepo.Create(context.TODO(), &event)
}

func (e DeviceUpgradeExecutor) loadFirmware(ctx context.Context, gateway string, device entity.Device) error {
	payload, err := global.ReadFile("resources/firmwares", e.firmware.Filename)
	if err != nil {
		return fmt.Errorf("device [%s] upgrade failed: %v", device.MacAddress, err)
	}
	firmwareData := make([][]byte, 0)
	for len(payload) > 0 {
		if len(payload) > 1024 {
			firmwareData = append(firmwareData, payload[:1024])
			payload = payload[1024:]
		} else {
			firmwareData = append(firmwareData, payload)
			payload = payload[len(payload):]
		}
	}
	for seqID := 0; seqID < len(firmwareData); {
		seqId, progress, err := e.sendFirmwareData(ctx, gateway, device, seqID, firmwareData[seqID])
		if err != nil {
			return err
		}
		device.UpdateDeviceUpgradeStatus(entity.DeviceUpgradeLoading, progress)
		seqID = seqId + 1
	}
	xlog.Infof("load firmware data complete => [%s]", device.MacAddress)
	return nil
}

func (e DeviceUpgradeExecutor) sendFirmwareData(ctx context.Context, gateway string, device entity.Device, seqID int, data []byte) (int, float32, error) {
	cmd := newLoadFirmwareCmd(e.firmware.ID, seqID, data, int(e.firmware.Size))
	resp, err := cmd.Execute(gateway, device.MacAddress)
	if err != nil {
		return 0, 0, err
	}
	if resp.Code == 0 {
		status := map[string]interface{}{}
		if err := json.Unmarshal(resp.Payload, &status); err != nil {
			return 0, 0, err
		}
		return cast.ToInt(status["seqId"]), cast.ToFloat32(status["progress"]), nil
	}
	return 0, 0, fmt.Errorf("device [%s] upgrade failed: %s", device.MacAddress, resp.Code)
}

func (e DeviceUpgradeExecutor) upgrade(ctx context.Context, gateway string, device entity.Device) int {
	xlog.Infof("start upgrade device => [%s]", device.MacAddress)
	ch := make(chan int32)
	topic := fmt.Sprintf("iot/v2/gw/%s/dev/%s/msg/firmwareUpgradeStatus/", gateway, device.MacAddress)
	err := adapter.IoT.Subscribe(topic, 1, func(c mqtt2.Client, msg mqtt2.Message) {
		m := pd.FirmwareUpgradeStatusMessage{}
		if err := proto.Unmarshal(msg.Payload(), &m); err != nil {
			return
		}
		if m.Code != 0 {
			device.UpdateDeviceUpgradeStatus(entity.DeviceUpgradeError, m.Progress)
			ch <- m.Code
		} else {
			device.UpdateDeviceUpgradeStatus(entity.DeviceUpgradeUpgrading, m.Progress)
		}
		if m.Progress == 100 {
			ch <- m.Code
		}
	})
	if err != nil {
		ch <- -1
	}
	defer func() {
		adapter.IoT.Unsubscribe(topic)
	}()
	select {
	case code := <-ch:
		return int(code)
	case <-ctx.Done():
		return 1
	}
}
