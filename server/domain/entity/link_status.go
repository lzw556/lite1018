package entity

type LinkStatus struct {
	Param                  int    `json:"param"`
	Address                string `json:"address"`
	State                  string `json:"state"`
	LastConnection         int64  `json:"lastConnection"`
	LastCall               uint   `json:"lastCall"`
	LastProvisioning       uint   `json:"lastProvisioning"`
	NumCallRetries         uint   `json:"numCallRetries"`
	NumProvisioningRetries uint   `json:"numProvisioningRetries"`
	StateUpdateTime        int64  `json:"stateUpdateTime"`
}
