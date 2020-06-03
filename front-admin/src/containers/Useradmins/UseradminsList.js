/* eslint-disable no-alert */

import React, { useState, useEffect } from 'react';
import {
  Button, Icon, Row,
} from 'antd';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import superagent from 'superagent';

import ZnTable from '../../components/ZnTable';
import { URLS } from '../../common/routes';

async function fetchUseradmins() {
  return superagent
    .get('/zen-admin-api/useradmins')
    .then(({ body }) => body);
}

export default function UseradminsList() {
  const history = useHistory();
  const [isLoading, _setIsLoading] = useState(false);
  const [useradmins, _setUseradmins] = useState([]);

  useEffect(() => {
    _setIsLoading(true);
    fetchUseradmins()
      .then(_setUseradmins)
      .then(() => _setIsLoading(false))
      .catch(() => _setIsLoading(false));
  }, []);

  const data = useradmins.map((useradmin) => ({
    ...useradmin,
    createdAt: moment(useradmin.createdAt).format('YYYY/MM/DD HH:mm:ss'),
    updatedAt: moment(useradmin.updatedAt).format('YYYY/MM/DD HH:mm:ss'),
  }));

  const columns = [
    { dataIndex: 'id', znSort: 'number' },
    { dataIndex: 'firstName', title: 'Prénom' },
    { dataIndex: 'lastName', title: 'Nom' },
    { dataIndex: 'email', title: 'E-mail' },
    {
      dataIndex: 'type',
      title: 'Type',
      filters: [
        { text: 'admin', value: 'admin' },
        { text: 'viewer', value: 'viewer' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'createdAt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      ellipsis: true,
      znSort: 'string',
      znSearchable: true,
    },
    {
      title: 'updatedAt',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      ellipsis: true,
      znSort: 'string',
      znSearchable: true,
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      fixed: 'right',
      width: 100,
      znSort: false,
      znSearchable: false,
      render: (text, record) => (
        <Button onClick={() => history.push(URLS.USERADMINS.edit(record.id))}>
          <Icon type="edit" style={{ color: 'orange' }} />
        </Button>
      ),
    },
  ];

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Liste d'utilisateurs admin</h1>

      <ZnTable
        rowKey="id"
        size="small"
        style={{ backgroundColor: 'white' }}
        columns={columns}
        dataSource={data}
        loading={isLoading}
        title={() => (
          <Row type="flex" justify="end">
            <Button type="primary" onClick={() => history.push(URLS.USERADMINS.add())}>
              <Icon type="plus" />
              {' '}
              {'Ajouter'}
            </Button>
          </Row>
        )}
      />
    </div>
  );
}
