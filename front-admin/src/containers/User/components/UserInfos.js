// @flow

import React from 'react';

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
  return (
    <div>
      <ul>
        {Object.entries(user)
          .filter(([, val]) => typeof val !== 'object' && !Array.isArray(val))
          .map(([key, val]) => (
            <li>
              <b>
                {LABELS[key] || key}
:
              </b>
              {' '}
              {val}
            </li>
          ))}
      </ul>
    </div>
  );
}
