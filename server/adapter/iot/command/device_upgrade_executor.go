package command

import (
	"context"
	"errors"
	"fmt"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/background"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/global"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"math"
	"strconv"
)

var (
	ErrUpgradeCancelled = errors.New("upgrade cancelled")
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
	payload, err := global.ReadFile("resources/firmwares", e.firmware.Filename)
	if err != nil {
		return fmt.Errorf("device [%s] upgrade failed: %v", device.MacAddress, err)
	}
	cmd := newUpgradeFirmwareCmd(e.firmware)
	resp, err := cmd.Execute(gateway.MacAddress, device.MacAddress, device.IsNB())
	if err != nil {
		return err
	}
	xlog.Infof("start device upgrade job => [%s]", device.MacAddress)
	m := pd.FirmwareUpgradeResponseMessage{}
	if err = m.Unmarshal(resp.Payload); err != nil {
		return err
	}
	if resp.Code == 1 {
		if m.BlockSize > 0 {
			partsNum := int(math.Ceil(float64(e.firmware.Size) / float64(m.BlockSize)))
			upgradeCache := cache.UpgradeCache{
				FirmwareSize: int32(e.firmware.Size),
				Packets:      map[string][]byte{},
			}
			for i := 0; i < partsNum; i++ {
				offset := i * int(m.BlockSize)
				partSize := math.Min(float64(m.BlockSize), float64(int32(e.firmware.Size)-int32(offset)))
				upgradeCache.Packets[strconv.Itoa(i)] = payload[offset : offset+int(partSize)]
			}
			cache.SetFirmware(fmt.Sprintf("%s_%s", device.MacAddress, e.firmware.Crc), &upgradeCache)
		} else {
			if err = e.loadFirmware(gateway.MacAddress, device, payload); err != nil {
				if err == ErrUpgradeCancelled {
					device.UpdateDeviceUpgradeStatus(entity.DeviceUpgradeCancelled, 0)
				} else {
					device.UpdateDeviceUpgradeStatus(entity.DeviceUpgradeError, 0)
				}
				return err
			}
		}
	}
	return nil
}

func (e DeviceUpgradeExecutor) loadFirmware(gateway string, device entity.Device, payload []byte) error {
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
		switch device.GetUpgradeStatus().Code {
		case entity.DeviceUpgradeCancelled, entity.DeviceUpgradeError:
			return nil
		default:
			seqId, progress, err := e.sendFirmwareData(gateway, device, seqID, firmwareData[seqID])
			if err != nil {
				xlog.Errorf("load firmware data failed: %v => [%s]", err, device.MacAddress)
				return err
			}
			device.UpdateDeviceUpgradeStatus(entity.DeviceUpgradeLoading, progress)
			seqID = seqId + 1
		}
	}
	device.UpdateDeviceUpgradeStatus(entity.DeviceUpgradePending, 0)
	xlog.Infof("load firmware data complete => [%s]", device.MacAddress)
	return nil
}

func (e DeviceUpgradeExecutor) sendFirmwareData(gateway string, device entity.Device, seqID int, data []byte) (int, float32, error) {
	cmd := newLoadFirmwareCmd(e.firmware.ID, seqID, data, int(e.firmware.Size))
	resp, err := cmd.Execute(gateway, device.MacAddress, device.IsNB())
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
	return 0, 0, ErrUpgradeCancelled
}
