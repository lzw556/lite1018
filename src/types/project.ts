import { ProjectType } from '../project';

export type Project = {
  id: number;
  name: string;
  description: string;
  token: string;
  type: ProjectType;
};
