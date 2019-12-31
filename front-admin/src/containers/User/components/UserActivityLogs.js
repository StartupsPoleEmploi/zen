// @flow

import React from 'react';
import moment from 'moment';

import ZnTable from '../../../components/ZnTable';

type Props = {
  activityLogs: Array<Object>,
}

export default function UserActivityLogs({ activityLogs = [] }: Props) {
  const data = activityLogs.map((activityLog) => ({
    ...activityLog,
    metadata: JSON.stringify(activityLog.metadata || {}),
    createdAt: moment(activityLog.createdAt).format('DD/MM/YYYY'),
  }));

  const columns = [
    { dataIndex: 'id', znSort: 'number' },
    { dataIndex: 'action', title: 'Action' },
    { dataIndex: 'createdAt', title: 'Inscrit le' },
    {
      dataIndex: 'metadata', title: 'Info', znSort: null, znSearchable: null,
    },
  ];

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Activités</h1>

      <ZnTable
        rowKey="id"
        size="small"
        style={{ backgroundColor: 'white' }}
        columns={columns}
        dataSource={data}
      />
    </div>
  );
}
