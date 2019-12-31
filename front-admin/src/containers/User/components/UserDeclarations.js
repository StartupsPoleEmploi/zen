// @flow

import React from 'react';
import moment from 'moment';

import ZnTable from '../../../components/ZnTable';

type Props = {
  declarations: Array<Object>,
}

export default function UserDeclarations({ declarations = [] }: Props) {
  const data = declarations.map((declaration) => ({
    ...declaration,
    isFinished: declaration.isFinished ? 'oui' : 'non',
    createdAt: moment(declaration.createdAt).format('DD/MM/YYYY'),
    updatedAt: moment(declaration.updatedAt).format('DD/MM/YYYY'),
  }));

  const columns = [
    { dataIndex: 'id', znSort: 'number' },
    { dataIndex: 'monthId', title: 'Moin', znSort: 'number' },
    { dataIndex: 'isFinished', title: 'isFinished', znSort: 'string' },
    { dataIndex: 'createdAt', title: 'Inscrit le' },
    { dataIndex: 'updatedAt', title: 'Mise à jour le' },
  ];

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Declarations</h1>

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
