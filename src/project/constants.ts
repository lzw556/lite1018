import { pickOptionsFromNumericEnum } from '../utils';

export enum ProjectType {
  General = 0x00,
  WindTurbinePro = 0x11,
  WindTurbine = 0x12,
  Hydro = 0x13,
  Corrosion = 0x21,
  CorrosionWirelessHart = 0x22,
  Vibration = 0x31
}

export const useProjectTypeOptions = () => pickOptionsFromNumericEnum(ProjectType, 'project.type.');
