package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
	"golang.org/x/sync/errgroup"
)

type ProjectDeleteCmd struct {
	entity.Project

	projectRepo                dependency.ProjectRepository
	networkRepo                dependency.NetworkRepository
	deviceRepo                 dependency.DeviceRepository
	deviceStateRepo            dependency.DeviceStateRepository
	deviceAlertStateRepo       dependency.DeviceAlertStateRepository
	alarmRuleRepo              dependency.AlarmRuleRepository
	alarmRecordRepo            dependency.AlarmRecordRepository
	alarmRecordAcknowledgeRepo dependency.AlarmRecordAcknowledgeRepository
	alarmSourceRepo            dependency.AlarmSourceRepository
	eventRepo                  dependency.EventRepository
	userProjectRelationRepo    dependency.UserProjectRelationRepository
}

func NewProjectDeleteCmd() ProjectDeleteCmd {
	return ProjectDeleteCmd{
		projectRepo:                repository.Project{},
		networkRepo:                repository.Network{},
		deviceRepo:                 repository.Device{},
		deviceStateRepo:            repository.DeviceState{},
		deviceAlertStateRepo:       repository.DeviceAlertState{},
		alarmRuleRepo:              repository.AlarmRule{},
		alarmSourceRepo:            repository.AlarmSource{},
		alarmRecordRepo:            repository.AlarmRecord{},
		alarmRecordAcknowledgeRepo: repository.AlarmRecordAcknowledge{},
		eventRepo:                  repository.Event{},
		userProjectRelationRepo:    repository.UserProjectRelation{},
	}
}

func (cmd ProjectDeleteCmd) Run() error {
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.removeDevices(txCtx); err != nil {
			return err
		}
		if err := cmd.removeAlarms(txCtx); err != nil {
			return err
		}
		if err := cmd.removeEvents(txCtx); err != nil {
			return err
		}
		if err := cmd.removeUserProjectRelation(txCtx); err != nil {
			return err
		}
		return cmd.projectRepo.Delete(txCtx, cmd.Project.ID)
	})
}

func (cmd ProjectDeleteCmd) removeAlarms(ctx context.Context) error {
	var eg errgroup.Group

	eg.Go(func() error {
		alarmRules, err := cmd.alarmRuleRepo.FindBySpecs(ctx, spec.ProjectEqSpec(cmd.Project.ID))
		if err != nil {
			return err
		}
		ruleIDs := make([]uint, len(alarmRules))
		for i, rule := range alarmRules {
			ruleIDs[i] = rule.ID
		}
		if err := cmd.alarmSourceRepo.DeleteBySpecs(ctx, spec.AlarmRuleInSpec(ruleIDs)); err != nil {
			return err
		}

		return cmd.alarmRuleRepo.DeleteBySpecs(ctx, spec.ProjectEqSpec(cmd.Project.ID))
	})

	eg.Go(func() error {
		alarmRecords, err := cmd.alarmRecordRepo.FindBySpecs(ctx, spec.ProjectEqSpec(cmd.Project.ID))
		if err != nil {
			return err
		}
		recordIDs := make([]uint, len(alarmRecords))
		for i, record := range alarmRecords {
			recordIDs[i] = record.ID
		}
		if err := cmd.alarmRecordAcknowledgeRepo.DeleteBySpecs(ctx, spec.AlarmRecordInSpec(recordIDs)); err != nil {
			return err
		}

		return cmd.alarmRecordRepo.DeleteBySpecs(ctx, spec.ProjectEqSpec(cmd.Project.ID))
	})
	return eg.Wait()
}

func (cmd ProjectDeleteCmd) removeDevices(ctx context.Context) error {
	var eg errgroup.Group
	eg.Go(func() error {
		return cmd.networkRepo.DeleteBySpecs(ctx, spec.ProjectEqSpec(cmd.Project.ID))
	})

	eg.Go(func() error {
		devices, err := cmd.deviceRepo.FindBySpecs(ctx, spec.ProjectEqSpec(cmd.Project.ID))
		if err != nil {
			return err
		}
		for _, device := range devices {
			if err := cmd.deviceStateRepo.Delete(device.MacAddress); err != nil {
				return err
			}
			if err := cmd.deviceAlertStateRepo.DeleteAll(device.MacAddress); err != nil {
				return err
			}
		}
		return cmd.deviceRepo.DeleteBySpecs(ctx, spec.ProjectEqSpec(cmd.Project.ID))
	})

	return eg.Wait()
}

func (cmd ProjectDeleteCmd) removeEvents(ctx context.Context) error {
	return cmd.eventRepo.DeleteBySpecs(ctx, spec.ProjectEqSpec(cmd.Project.ID))
}

func (cmd ProjectDeleteCmd) removeUserProjectRelation(ctx context.Context) error {
	return cmd.userProjectRelationRepo.DeleteBySpecs(ctx, spec.ProjectEqSpec(cmd.Project.ID))
}
