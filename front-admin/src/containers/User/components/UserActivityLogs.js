// @flow

import React from 'react';
import moment from 'moment';
import { Card } from 'antd';

import ZnTable from '../../../components/ZnTable';

type Props = {
  activityLogs: Array<Object>,
}

export default function UserActivityLogs({ activityLogs = [] }: Props) {
  const data = activityLogs.map((activityLog) => ({
    ...activityLog,
    metadata: JSON.stringify(activityLog.metadata || {}),
    createdAt: moment(activityLog.createdAt).format('YYYY/MM/DD HH:mm:ss'),
  }));

  const columns = [
    { dataIndex: 'id', znSort: 'number' },
    { dataIndex: 'action', title: 'Action' },
    { dataIndex: 'createdAt', title: 'Créé le', defaultSortOrder: 'descend' },
    {
      dataIndex: 'metadata', title: 'Info', znSort: null, znSearchable: null,
    },
  ];

  return (
    <Card title="Activités" style={{ marginBottom: '20px' }}>
      <ZnTable
        rowKey="id"
        size="small"
        style={{ backgroundColor: 'white' }}
        columns={columns}
        dataSource={data}
      />
    </Card>
  );
}
