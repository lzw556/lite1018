package request

type Role struct {
	Name        string `json:"name" binding:"required,max=16,min=2"`
	Description string `json:"description"`
}

type AllocMenus struct {
	IDs []uint `json:"ids"`
}

type AllocPermissions struct {
	IDs []uint `json:"ids"`
}
