/* eslint-disable no-alert */

import React from 'react';
import {
  Button, Switch, Form, Icon, Row,
} from 'antd';
import moment from 'moment';
import { useHistory } from 'react-router-dom';

import ZnTable from '../../components/ZnTable';
import { URLS } from '../../common/routes';
import { useUsers } from '../../common/contexts/usersCtx';

export default function UsersList() {
  const history = useHistory();
  const {
    users, showAuthorizedUsers, setAuthorizedUsers, isLoading,
  } = useUsers();

  if (users.length === 0) return null;

  const data = users.map((user) => ({
    ...user,
    isAuthorized: user.isAuthorized ? 'oui' : 'non',
    isActuDone: user.isActuDone ? 'oui' : 'non',
    registeredAt: moment(user.createdAt).format('YYYY/MM/DD HH:mm:ss'),
    createdAt: moment(user.createdAt).format('YYYY/MM/DD HH:mm:ss'),
  }));

  const columns = [
    { dataIndex: 'id', znSort: 'number' },
    { dataIndex: 'firstName', title: 'Prénom' },
    { dataIndex: 'lastName', title: 'Nom' },
    { dataIndex: 'email', title: 'E-mail' },
    { dataIndex: 'postalCode', title: 'Code postal' },
    {
      dataIndex: 'isAuthorized',
      title: 'Autorisé',
      znSort: null,
      znSearchable: null,
      filters: [
        { text: 'Oui', value: 'oui' },
        { text: 'Non', value: 'non' },
      ],
      onFilter: (value, record) => record.isAuthorized === value,
    },
    {
      dataIndex: 'isActuDone',
      title: 'ActuFait (PeDump)',
      znSort: null,
      znSearchable: null,
      filters: [
        { text: 'Oui', value: 'oui' },
        { text: 'Non', value: 'non' },
      ],
      onFilter: (value, record) => record.isActuDone === value,
    },
    { dataIndex: 'registeredAt', title: 'Inscrit le' },
    {
      title: 'Action',
      dataIndex: 'operation',
      fixed: 'right',
      width: 100,
      znSort: false,
      znSearchable: false,
      render: (text, record) => (
        <Button onClick={() => history.push(URLS.USERS.view(record.id))} target="_blank">
          <Icon type="eye" style={{ color: 'blue' }} />
        </Button>
      ),
    },
  ];

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Liste d'utilisateurs</h1>

      <div>
        <Form.Item label={`Utilisateurs ${showAuthorizedUsers ? '' : ' non '} autorisés`}>
          <Switch defaultChecked={showAuthorizedUsers} onChange={setAuthorizedUsers} />
        </Form.Item>
      </div>
      <ZnTable
        rowKey="id"
        size="small"
        style={{ backgroundColor: 'white' }}
        columns={columns}
        dataSource={data}
        loading={isLoading}
        title={() => (
          <Row type="flex" justify="end">
            <Button type="primary" href={`/zen-admin-api/users/csv?authorized=${showAuthorizedUsers ? 'true' : 'false'}`}>
              <Icon type="download" />
              {' '}
              {`Utilisateurs ${showAuthorizedUsers ? '' : 'non'} autorisés`}
            </Button>
          </Row>
        )}
      />
    </div>
  );
}
