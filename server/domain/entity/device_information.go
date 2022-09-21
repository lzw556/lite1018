package entity

type DeviceInformation struct {
	Name              string `json:"name"`
	Model             string `json:"model"`
	Manufacturer      string `json:"manufacturer"`
	FirmwareVersion   string `json:"firmware_version"`
	FirmwareBuildTime string `json:"firmware_build_time"`
	BleMark           string `json:"ble_mark"`
	IPAddress         string `json:"ip_address"`
	SubnetMask        string `json:"subnet_mask"`
	Gateway           string `json:"gateway"`
	ProductID         uint   `json:"product_id"`
	Timestamp         int64  `json:"timestamp"`
	IccID4G           string `json:"iccid_4g"`
}

func (DeviceInformation) BucketName() string {
	return "ts_device_information"
}
