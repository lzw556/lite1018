import { Button, Col, Drawer, DrawerProps, Row, Space, Tree } from 'antd';
import { FC, useCallback, useEffect, useState } from 'react';
import { Project } from '../../types/project';
import { AllocUsersRequest, GetAllocUsersRequest } from '../../apis/project';
import { AllocUser } from '../../types/alloc_user';
import Search from 'antd/es/input/Search';

export interface AllocUserDrawerProps extends DrawerProps {
  project: Project;
  onSuccess: () => void;
}

const AllocUserDrawer: FC<AllocUserDrawerProps> = (props) => {
  const { project, visible, onSuccess } = props;
  const [dataSource, setDataSource] = useState<AllocUser[]>([]);
  const [treeData, setTreeData] = useState<any>();
  const [checkedKeys, setCheckedKeys] = useState<any[]>([]);

  const fetchUsers = useCallback(() => {
    GetAllocUsersRequest(project.id).then(setDataSource);
  }, []);

  useEffect(() => {
    if (visible) {
      fetchUsers();
    }
  }, [visible, fetchUsers]);

  useEffect(() => {
    if (dataSource) {
      setTreeData(convertTreeData(dataSource));
      setCheckedKeys(convertCheckedKeys(dataSource));
    }
  }, [dataSource]);

  const onSave = () => {
    AllocUsersRequest(project.id, { user_ids: checkedKeys }).then((_) => onSuccess());
  };

  const renderExtra = () => {
    return (
      <Space>
        <Button type={'primary'} onClick={onSave}>
          保存
        </Button>
      </Space>
    );
  };

  const convertTreeData = (dataSource: AllocUser[]) => {
    return [
      {
        title: '用户列表',
        key: 'users',
        checkable: false,
        children: dataSource.map((item) => {
          return {
            title: item.user.username,
            key: item.user.id
          };
        })
      }
    ];
  };

  const convertCheckedKeys = (dataSource: AllocUser[]) => {
    return dataSource.filter((item) => item.isAllocated).map((item) => item.user.id);
  };

  const onCheck = (value: any) => {
    setCheckedKeys(value);
  };

  const onChange = (value: any) => {
    setTreeData(
      convertTreeData(dataSource?.filter((item) => item.user.username.indexOf(value) !== -1))
    );
    setCheckedKeys(
      convertCheckedKeys(dataSource?.filter((item) => item.user.username.indexOf(value) !== -1))
    );
  };

  return (
    <Drawer {...props} title={project.name} placement={'right'} extra={renderExtra()}>
      <Row justify={'center'}>
        <Col span={24}>
          <Search placeholder={'请输入用户名进行搜索'} onChange={(e) => onChange(e.target.value)} />
        </Col>
      </Row>
      <Row justify={'start'}>
        <Col span={24}>
          {treeData && (
            <Tree
              defaultExpandAll={true}
              treeData={treeData}
              showIcon={true}
              selectable={false}
              checkable={true}
              checkedKeys={checkedKeys}
              onCheck={onCheck}
            />
          )}
        </Col>
      </Row>
    </Drawer>
  );
};

export default AllocUserDrawer;
