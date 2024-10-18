import { ProjectType } from '../views/project/projectTypes';

export type Project = {
  id: number;
  name: string;
  description: string;
  token: string;
  type: ProjectType;
};
