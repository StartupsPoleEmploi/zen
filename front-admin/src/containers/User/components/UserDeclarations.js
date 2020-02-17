// @flow

import React, { useEffect } from 'react';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import { Button, Icon, Card } from 'antd';

import ZnTable from '../../../components/ZnTable';
import { URLS } from '../../../common/routes';
import { useDeclarations } from '../../../common/contexts/declarationsCtx';


function formatDate(availableMonths, monthId) {
  if (!monthId) return '';
  const dateFind = availableMonths.find((e) => e.id === monthId);
  if (!dateFind) return '';
  return `${moment(dateFind.month).format('YYYY/MM')}`;
}

type Props = {
  declarations: Array<Object>,
}

export default function UserDeclarations({ declarations = [] }: Props) {
  const history = useHistory();
  const { availableMonths, init } = useDeclarations();

  useEffect(() => {
    init();
  }, [init]);

  const data = declarations.map((declaration) => ({
    ...declaration,
    isFinished: declaration.isFinished ? 'oui' : 'non',
    createdAt: moment(declaration.createdAt).format('YYYY/MM/DD HH:mm:ss'),
    updatedAt: moment(declaration.updatedAt).format('YYYY/MM/DD HH:mm:ss'),
    month: `${formatDate(availableMonths, declaration.monthId)} (${declaration.monthId})`,
  }));

  const columns = [
    { dataIndex: 'id', znSort: 'number' },
    { dataIndex: 'month', title: 'Mois', defaultSortOrder: 'descend' },
    { dataIndex: 'isFinished', title: 'isFinished', znSort: 'string' },
    { dataIndex: 'createdAt', title: 'Débuté le' },
    { dataIndex: 'updatedAt', title: 'Mise à jour le' },
    {
      title: 'Action',
      dataIndex: 'operation',
      fixed: 'right',
      width: 100,
      znSort: false,
      znSearchable: false,
      render: (text, record) => (
        <Button onClick={() => history.push(URLS.DECLARATIONS.view(record.id))}>
          <Icon type="eye" style={{ color: 'blue' }} />
        </Button>
      ),
    },
  ];


  return (
    <Card title="Declarations" style={{ marginBottom: '20px' }}>
      <ZnTable
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={data}
      />
    </Card>
  );
}
