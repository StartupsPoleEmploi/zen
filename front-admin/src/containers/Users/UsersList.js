/* eslint-disable no-alert */

import React, { useEffect, useState } from 'react';
import {
  Button, Switch, Form, Icon, Row,
} from 'antd';
import superagent from 'superagent';
import moment from 'moment';

import ZnTable from '../../components/ZnTable';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [showAuthorizedUsers, setAuthorizedUsers] = useState(false);

  const fetchUsers = () => superagent
    .get(`/zen-admin-api/users?authorized=${showAuthorizedUsers ? 'true' : 'false'}`)
    .then(({ body }) => setUsers(body));

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAuthorizedUsers]);

  if (users.length === 0) return null;

  const data = users.map((user) => ({
    ...user,
    isAuthorized: user.isAuthorized ? 'oui' : 'non',
    createdAt: moment(user.createdAt).format('DD/MM/YYYY'),
  }));

  const columns = [
    { dataIndex: 'id', znSort: 'number' },
    { dataIndex: 'firstName', title: 'Prénom' },
    { dataIndex: 'lastName', title: 'Nom' },
    { dataIndex: 'email', title: 'E-mail' },
    { dataIndex: 'postalCode', title: 'Code postal' },
    {
      dataIndex: 'isAuthorized', title: 'Autorisé', znSort: null, znSearchable: null,
    },
    { dataIndex: 'createdAt', title: 'Inscrit le' },
  ];

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Liste d'utilisateurs</h1>

      <div>
        <Form.Item label={`Utilisateurs ${showAuthorizedUsers ? '' : ' non '} autorisés`}>
          <Switch onChange={setAuthorizedUsers} />
        </Form.Item>
      </div>
      <div />
      <ZnTable
        rowKey="id"
        size="small"
        style={{ backgroundColor: 'white' }}
        columns={columns}
        dataSource={data}
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
