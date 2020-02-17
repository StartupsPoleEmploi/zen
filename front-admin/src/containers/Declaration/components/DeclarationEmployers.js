import React from 'react';
import { Card } from 'antd';
import moment from 'moment';

import ZnTable from '../../../components/ZnTable';

function calculateTotal(employers, field) {
  const sum = employers.reduce(
    (prev, employer) => parseFloat(employer[field]) + prev,
    0,
  );
  return Math.round(sum);
}

const defaultVal = { znSearchable: false, znSort: null, ellipsis: false };
const COLUMNS_EMPLOYERS = [
  { title: 'Id', dataIndex: 'id', ...defaultVal },
  { title: 'Nom employeur', dataIndex: 'employerName', ...defaultVal },
  { title: 'Salaire', dataIndex: 'salary', ...defaultVal },
  { title: 'Contrat terminé', dataIndex: 'hasEndedThisMonth', ...defaultVal },
  { title: 'Créé le', dataIndex: 'createdAt', ...defaultVal },
  { title: 'Modifié le', dataIndex: 'updatedAt', ...defaultVal },
];
const COLUMNS_DOCS = [
  { title: 'Id', dataIndex: 'id', ...defaultVal },
  { title: 'Type', dataIndex: 'type', ...defaultVal },
  { title: 'Nom du fichier', dataIndex: 'originalFileName', ...defaultVal },
  { title: 'Transmis', dataIndex: 'isTransmitted', ...defaultVal },
  { title: 'Nettoyé', dataIndex: 'isCleanedUp', ...defaultVal },
  { title: 'Créé le', dataIndex: 'createdAt', ...defaultVal },
  { title: 'Modifié le', dataIndex: 'updatedAt', ...defaultVal },
  { title: 'Fichier', dataIndex: 'file', ...defaultVal },
];

type Props = {
  declaration: Object,
};

export default function DeclarationEmployers({ declaration }: Props) {
  const workHours = calculateTotal(declaration.employers, 'workHours');
  const salary = calculateTotal(declaration.employers, 'salary');
  const totalStr = `Total: ${workHours} h, ${salary} €`;

  const data = declaration.employers.map((employer) => ({
    ...employer,
    hasEndedThisMonth: employer.hasEndedThisMonth ? 'oui' : 'non',
    createdAt: moment(employer.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: moment(employer.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
  }));

  return (
    <Card
      title="Employeurs"
      style={{ marginBottom: '20px' }}
      extra={<h3>{totalStr}</h3>}
    >
      <ZnTable
        rowKey="id"
        size="small"
        style={{ backgroundColor: 'white' }}
        columns={COLUMNS_EMPLOYERS}
        dataSource={data}
        pagination={false}
        expandedRowRender={(employer) => {
          const dataDoc = employer.documents.map((doc) => ({
            ...doc,
            isTransmitted: doc.isTransmitted ? 'oui' : 'non',
            isCleanedUp: doc.isCleanedUp ? 'oui' : 'non',
            createdAt: moment(doc.createdAt).format('YYYY-MM-DD HH:mm:ss'),
            updatedAt: moment(doc.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
          }));
          return (
            <div style={{ marginTop: '8px', marginBottom: '8px' }}>
              <ZnTable
                rowKey="id"
                size="small"
                style={{ backgroundColor: 'white' }}
                columns={COLUMNS_DOCS}
                dataSource={dataDoc}
                pagination={false}
              />
            </div>
          );
        }}
      />
    </Card>
  );
}
