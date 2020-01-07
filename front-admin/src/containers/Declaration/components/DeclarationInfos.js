import React from 'react';
import moment from 'moment';
import { Card } from 'antd';

import ZnTable from '../../../components/ZnTable';

const statuses = [
  {
    field: 'internship',
    boolField: 'hasInternship',
    label: 'Stage',
  },
  {
    field: 'sickLeave',
    boolField: 'hasSickLeave',
    label: 'Congé maladie',
  },
  {
    field: 'maternityLeave',
    boolField: 'hasMaternityLeave',
    label: 'Congé maternité',
  },
  {
    field: 'retirement',
    boolField: 'hasRetirement',
    label: 'Retraite',
  },
  {
    field: 'invalidity',
    boolField: 'hasInvalidity',
    label: 'Est invalide',
  },
  {
    field: 'jobSearch',
    boolField: 'isLookingForJob',
    label: 'Arrêté de chercher du travail',
  },
];

const defaultVal = { znSearchable: false, znSort: null, ellipsis: false };
const COLUMNS = [
  { title: 'Id', dataIndex: 'id', ...defaultVal },
  { title: 'Type', dataIndex: 'type', ...defaultVal },
  { title: 'Nom du fichier', dataIndex: 'originalFileName', ...defaultVal },
  { title: 'Du', dataIndex: 'startDate', ...defaultVal },
  { title: 'Au', dataIndex: 'endDate', ...defaultVal },
  { title: 'Transmi', dataIndex: 'isTransmitted', ...defaultVal },
  { title: 'Nettoyé', dataIndex: 'isCleanedUp', ...defaultVal },
  { title: 'Fichier', dataIndex: 'file', ...defaultVal },
];

type Props = {
  declaration: Object,
};

export default function DeclarationInfos({ declaration }: Props) {
  if (!declaration.infos.length) return null;

  const data = declaration.infos
    .map((infos) => ({
      ...infos,
      isTransmitted: infos.isTransmitted ? 'oui' : 'non',
      isCleanedUp: infos.isCleanedUp ? 'oui' : 'non',
      startDate: infos.startDate && moment(infos.startDate).format('DD/MM'),
      endDate: infos.startDate && moment(infos.updatedAt).format('DD/MM'),
      type: (statuses.find(({ field }) => field === infos.type) || { label: infos.type }).label,
    }));
  return (
    <Card
      title="Information supplémentaires"
      style={{ marginBottom: '20px' }}
    >
      <ZnTable
        rowKey="id"
        style={{ backgroundColor: 'white' }}
        columns={COLUMNS}
        dataSource={data}
        pagination={false}
      />
    </Card>
  );
}
