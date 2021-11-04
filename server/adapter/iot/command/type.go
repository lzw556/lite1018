package command

type Type uint

const (
	UpgradeCmdType Type = iota + 1
	CancelUpgradeCmdType
	ResetCmdType
	RebootCmdType
	ProvisionCmdType
)
