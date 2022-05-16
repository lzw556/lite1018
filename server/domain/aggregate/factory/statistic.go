package factory

import (
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"strings"
)

type Statistic struct {
}

func NewStatistic() Statistic {
	return Statistic{}
}

func (factory Statistic) NewStatisticQuery(filters request.Filters) *query.StatisticQuery {
	q := query.NewStatisticQuery()
	q.Specs = make([]spec.Specification, 0)
	for name, v := range filters {
		switch name {
		case "project_id":
			q.Specs = append(q.Specs, spec.ProjectEqSpec(cast.ToUint(v)))
		case "network_id":
			q.Specs = append(q.Specs, spec.NetworkEqSpec(cast.ToUint(v)))
		case "types":
			types := strings.Split(cast.ToString(v), ",")
			typeInSpec := make(spec.TypeInSpec, len(types))
			for i, t := range types {
				typeInSpec[i] = cast.ToUint(t)
			}
			q.Specs = append(q.Specs, typeInSpec)
		}
	}
	return &q
}
