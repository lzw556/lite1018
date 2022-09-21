package factory

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
)

type OpenApi struct {
	projectRepo dependency.ProjectRepository
}

func NewOpenApi() OpenApi {
	return OpenApi{
		projectRepo: repository.Project{},
	}
}

func (factory OpenApi) NewOpenApiQuery(projectID uint) (*query.OpenApiQuery, error) {
	project, err := factory.projectRepo.Get(context.Background(), projectID)
	if err != nil {
		return nil, response.ErrOpenApiProjectNotFound()
	}
	q := query.NewOpenApiQuery()
	q.Project = project
	return &q, nil
}
