// @flow

import React from 'react';
import { Card } from 'antd';

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
};

type Props = {
  user: Object,
}

export default function UserInfos({ user }: Props) {
  const data = {
    ...user,
    isAuthorized: user.isAuthorized ? 'oui' : 'non',
    isBlocked: user.isBlocked ? 'oui' : 'non',
  };
  return (
    <Card title="Information" style={{ marginBottom: '20px' }}>
      <table border="1">
        {Object.entries(data)
          .filter(([, val]) => typeof val !== 'object' && !Array.isArray(val))
          .map(([key, val]) => (
            <tr>
              <td>
                <b>{`${LABELS[key] || key}: `}</b>
              </td>
              <td>{val}</td>
            </tr>
          ))}
      </table>
    </Card>
  );
}
