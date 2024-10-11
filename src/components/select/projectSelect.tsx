import { Select, SelectProps } from 'antd';
import { FC, useState, useEffect } from 'react';
import { GetMyProjectsRequest } from '../../apis/project';
import { Project } from '../../types/project';
import { getProject } from '../../utils/session';
import './projectSelect.css';

const { Option } = Select;

export interface ProjectSelectProps extends SelectProps<any> {
  onChange?: (value: any) => void;
}

const ProjectSelect: FC<ProjectSelectProps> = (props) => {
  const [dataSource, setDataSource] = useState<Project[]>([]);

  useEffect(() => {
    GetMyProjectsRequest().then((data) => {
      setDataSource(data);
    });
  }, []);

  const projectId = getProject().id;
  if (!projectId) return null;

  return (
    <Select
      {...props}
      popupMatchSelectWidth={160}
      defaultValue={projectId}
      className='project-select'
    >
      {dataSource.map((item) => (
        <Option key={item.id} value={item.id}>
          {item.name}
        </Option>
      ))}
    </Select>
  );
};

export default ProjectSelect;
