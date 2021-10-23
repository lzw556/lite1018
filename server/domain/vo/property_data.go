package vo

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/xuri/excelize/v2"
	"time"
)

type PropertyData struct {
	Name   string               `json:"name"`
	Unit   string               `json:"unit"`
	Fields map[string][]float32 `json:"fields"`
	Time   []int64              `json:"time"`
	Alarms []AlarmRule          `json:"alarms,omitempty"`
}

func NewPropertyData(e po.Property) PropertyData {
	return PropertyData{
		Name:   e.Name,
		Unit:   e.Unit,
		Fields: map[string][]float32{},
		Alarms: make([]AlarmRule, 0),
	}
}

func (d *PropertyData) AddAlarms(es ...po.AlarmRule) {
	for _, e := range es {
		d.Alarms = append(d.Alarms, NewAlarmRule(e))
	}
}

func (d PropertyData) ToExcelFile() (*PropertyDataFile, error) {
	excel := excelize.NewFile()
	excel.NewSheet(d.Name)
	if err := excel.SetCellValue(d.Name, "A1", "时间"); err != nil {
		return nil, err
	}
	for i, value := range d.Time {
		t := time.Unix(value, 0)
		if err := excel.SetCellValue(d.Name, fmt.Sprintf("A%d", i+2), t.UTC()); err != nil {
			return nil, err
		}
	}
	columns := make([]string, len(d.Fields))
	for k := range d.Fields {
		columns = append(columns, k)
	}
	for i, column := range columns {
		cell := string(rune(66 + i))
		if err := excel.SetCellValue(d.Name, fmt.Sprintf("%s%d", cell, 1), column); err != nil {
			return nil, err
		}
		for j, value := range d.Fields[column] {
			if err := excel.SetCellValue(d.Name, fmt.Sprintf("%s%d", cell, j+2), value); err != nil {
				return nil, err
			}
		}
	}
	// delete default excel sheet
	excel.DeleteSheet("Sheet1")
	return &PropertyDataFile{
		Name: d.Name,
		File: excel,
	}, nil
}
