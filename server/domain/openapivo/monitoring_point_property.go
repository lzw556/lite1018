package openapivo

type MPField struct {
  Name string `json:"name"`
  Key  string `json:"key"`
}

type MPFields []MPField

type MPProperty struct {
  Name      string   `json:"name"`
  Key       string   `json:"key"`
  Unit      string   `json:"unit"`
  Sort      int      `json:"sort"`
  Precision int      `json:"precision"`
  Fields    MPFields `json:"fields"`
  IsShow    bool     `json:"isShow"`
}

type MPProperties []MPProperty

func (ps MPProperties) Len() int {
  return len(ps)
}

func (ps MPProperties) Less(i, j int) bool {
  return ps[i].Sort < ps[j].Sort
}

func (ps MPProperties) Swap(i, j int) {
  ps[i], ps[j] = ps[j], ps[i]
}
