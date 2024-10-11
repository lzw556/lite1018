import { Result, Spin } from 'antd';
import React from 'react';
import { GetMyProjectRequest, GetMyProjectsRequest } from '../../apis/project';
import { store } from '../../store';
import { Project } from '../../types/project';
import { getProject } from '../../utils/session';
import intl from 'react-intl-universal';

export const ValidateProject = ({ children }: { children: JSX.Element }) => {
  const [projects, setProjects] = React.useState<{
    result: Project[] | null;
    loading: boolean;
    error: string | null;
  }>({
    result: null,
    loading: false,
    error: null
  });
  const { result, loading, error } = projects;
  const [selectError, setSelectError] = React.useState<string | null>(null);
  const [projectId, setProjectId] = React.useState(getProject().id);

  React.useEffect(() => {
    setProjects((prev) => ({ ...prev, loading: true }));
    GetMyProjectsRequest()
      .then((res) => {
        setProjects((prev) => ({ ...prev, result: res }));
      })
      .catch((error) => setProjects((prev) => ({ ...prev, error })))
      .finally(() => {
        setProjects((prev) => ({ ...prev, loading: false }));
      });
  }, []);

  React.useEffect(() => {
    if (result && result.length > 0 && !getProject().id) {
      GetMyProjectRequest(result[0].id)
        .then((res) => {
          store.dispatch({
            type: 'SET_PROJECT',
            payload: { id: res.id, name: res.name }
          });
          setProjectId(res.id);
        })
        .catch(setSelectError);
    }
  }, [result]);
  if (error) return <Result status='500' title={intl.get('ERROR_UNKNOWN')} subTitle={error} />;
  if (loading || result === null || projectId === 0) return <Spin />;
  if (result.length === 0)
    return <Result status='500' title={intl.get('PROJECT_DOES_NOT_EXIST')} />;
  if (selectError)
    return (
      <Result
        status='500'
        title={intl.get('FAILED_TO_FIND_ONE_PROJECT')}
        subTitle={intl.get('CONNECT_ADMIN_PROMPT')}
      />
    );
  return children;
};
