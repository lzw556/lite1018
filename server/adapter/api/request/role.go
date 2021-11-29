package request

type Role struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type AllocMenus struct {
	IDs []uint `json:"ids"`
}
