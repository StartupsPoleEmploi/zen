// @flow

import React from 'react';
import { Card } from 'antd';

const LABELS = {
  isLookingForJob: 'Souhaite rester inscrit à Pôle emploi',
  createdAt: 'Créer le',
  updatedAt: 'Modifié le',
};

type Props = {
  declaration: Object,
}

function formatDeclaration(declaration) {
  const boolVal = (val) => (val ? 'oui' : 'non');
  const boolKeys = Object.keys(declaration).filter((key) => typeof declaration[key] === 'boolean');
  return {
    ...declaration,
    ...boolKeys.reduce(
      (acc, key) => ({ ...acc, [key]: boolVal(declaration[key]) }),
      {},
    ),
  };
}

export default function DeclarationDetails({ declaration }: Props) {
  const dec = formatDeclaration(declaration);
  return (
    <div>
      <Card title="Détails" style={{ marginBottom: '20px' }}>
        <table>
          {Object.entries(dec)
            .filter(([, val]) => typeof val !== 'object' && !Array.isArray(val))
            .map(([key, val]) => (
              <tr>
                <td><b>{`${LABELS[key] || key} : `}</b></td>
                <td>{val}</td>
              </tr>
            ))}
        </table>
      </Card>
    </div>
  );
}
