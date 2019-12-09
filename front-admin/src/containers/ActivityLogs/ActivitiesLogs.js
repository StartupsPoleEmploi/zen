import React, { useState, useEffect } from 'react';
import superagent from 'superagent';
import moment from 'moment';

import ZnContent from '../../components/ZnContent';
import ZnHeader from '../../components/ZnHeader';
import ZnTable from '../../components/ZnTable';

const actionsLabels = {
  VALIDATE_DECLARATION: 'Étape 1 (déclaration initiale) terminée',
  VALIDATE_EMPLOYERS: 'Étape 2 (employeurs, salaires et heures travaillée) terminée',
  VALIDATE_FILES: 'Étape 3 (envoi des fichiers) terminée',
  TRANSMIT_FILE: 'Fichier transmis sur pole-emploi.fr',
  TRANSMIT_DECLARATION: 'Déclaration transmise sur pole-emploi.fr',
};

export default function ActivitiesLogs() {
  const [activityLog, setActivityLog] = useState(null);

  useEffect(() => {
    superagent.get('/zen-admin-api/activityLog').then(({ body }) => {
      setActivityLog(body);
    });
  }, []);

  if (!activityLog) return null;

  const data = activityLog.map((log) => ({
    ...log,
    name: `${log.user.firstName} ${log.user.lastName}`,
    declarationId: log.metadata.declarationId,
    action: actionsLabels[log.action],
    createdAt: moment(log.createdAt).format('YYYY-MM-DD HH:mm:ss'),
  }));

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
      znSort: 'number',
      znSearchable: true,
    },
    {
      title: 'userId',
      dataIndex: 'userId',
      key: 'userId',
      ellipsis: true,
      znSort: 'number',
      znSearchable: true,
    },
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      znSort: 'string',
      znSearchable: true,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      ellipsis: true,
      znSort: 'string',
      znSearchable: true,
    },
    {
      title: 'declarationId',
      dataIndex: 'declarationId',
      key: 'status',
      ellipsis: true,
      znSort: 'string',
      znSearchable: true,
    },
    {
      title: 'createdAt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      ellipsis: true,
      znSort: 'string',
      znSearchable: true,
    },
  ];

  return (
    <div style={{ textAlign: 'center' }}>
      <ZnHeader title="Activités" />
      <ZnContent>
        <ZnTable
          rowKey="id"
          size="small"
          style={{ backgroundColor: 'white' }}
          columns={columns}
          dataSource={data}
        />
      </ZnContent>
    </div>
  );
}
