package command

type Type uint

const (
	UpgradeCmdType Type = iota + 1
	CancelUpgradeCmdType
	ResetCmdType
	ResetDataCmdType
	RebootCmdType
	ProvisionCmdType
)
