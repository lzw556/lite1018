import { Result, Spin } from 'antd';
import React from 'react';
import { GetMyProjectRequest, GetMyProjectsRequest } from '../../apis/project';
import { store } from '../../store';
import { Project } from '../../types/project';
import { getProject } from '../../utils/session';

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
    if (result && result.length > 0 && !getProject()) {
      GetMyProjectRequest(result[0].id)
        .then((res) => {
          store.dispatch({
            type: 'SET_PROJECT',
            payload: res.id
          });
        })
        .catch(setSelectError);
    }
  }, [result]);

  if (error) return <Result status='500' title='内部错误' subTitle={error} />;
  if (loading || result === null) return <Spin />;
  if (result.length === 0) return <Result status='500' title='不存在项目' />;
  if (selectError)
    return (
      <Result status='500' title='未找到项目' subTitle='为了更好的体验，请先联系管理员创建项目' />
    );
  return children;
};
