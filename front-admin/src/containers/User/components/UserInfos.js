// @flow

import React from 'react';
import { Card } from 'antd';

import { getAgenceName } from '../../../common/agencesInfos';
import IconBoolean from '../../../components/IconBoolean';

const LABELS = {
  firstName: 'Prenom',
  lastName: 'Nom',
  email: 'E-mail',
  createdAt: 'Créer le',
  updatedAt: 'Modifié le',
  postalCode: 'Code postal',
  gender: 'Sexe',
  isAuthorized: 'Autorisé',
  registeredAt: 'Enregistré à',
  isBlocked: 'Radié',
  agencyCode: 'Code agence',
  situationRegardEmploiId: 'Situation regard emploi',
  isActuDone: 'ActuFait (PeDump)',
};

type Props = {
  user: Object,
}

export default function UserInfos({ user }: Props) {
  const data = {
    ...user,
    isAuthorized: <IconBoolean val={user.isAuthorized} />,
    isBlocked: <IconBoolean val={user.isBlocked} />,
    isActuDone: <IconBoolean val={user.isActuDone} />,
    agencyCode: getAgenceName(user.agencyCode),
  };
  const iconsKeys = ['isAuthorized', 'isBlocked', 'isActuDone'];
  return (
    <Card title="Information" style={{ marginBottom: '20px' }}>
      <table border="1">
        <tbody>
          {Object.entries(data)
            .filter(([key, val]) => iconsKeys.includes(key) || (typeof val !== 'object' && !Array.isArray(val)))
            .map(([key, val]) => (
              <tr key={key}>
                <td>
                  <b>{`${LABELS[key] || key}: `}</b>
                </td>
                <td>{val}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </Card>
  );
}
