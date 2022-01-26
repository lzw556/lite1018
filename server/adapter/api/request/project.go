package request

type Project struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type AllocUsers struct {
	UserIDs []uint `json:"user_ids"`
}
