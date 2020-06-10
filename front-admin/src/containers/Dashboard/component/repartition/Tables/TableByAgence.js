// @flow
import React from 'react';

import ZnTable from '../../../../../components/ZnTable';

const numberFormatter = Intl.NumberFormat('fr-Fr');
function formatNb(nb) {
  return numberFormatter.format(nb);
}

function extractAgencyCode(agencyLabel) {
  return agencyLabel.split('-')[0].trim();
}

type Props = {
  byAgencyTotal: Array<Array>,
  usersGlobalRepartition: Object,
}
export default function TableByAgence({ byAgencyTotal, usersGlobalRepartition }: Props) {
  const columns = [
    {
      title: 'Agence',
      dataIndex: 'agenceName',
      key: 'agenceName',
      znSort: 'string',
      znSearchable: true,
    },
    {
      title: 'Nb actualisations',
      dataIndex: 'nbActualisations',
      key: 'nbActualisations',
      znSort: 'numberToFormat',
      znSearchable: true,
    },
    {
      title: 'Nb total Assmat',
      dataIndex: 'totalUsersAgency',
      key: 'totalUsersDepartments',
      znSort: 'numberToFormat',
      znSearchable: true,
    },
    {
      title: 'Pourcentage %',
      dataIndex: 'percentage',
      key: 'percentage',
      znSort: 'numberToFormat',
      znSearchable: true,
    },
  ];

  const data = byAgencyTotal.map(([agenceName, total]) => {
    const totalUsersAgency = usersGlobalRepartition.agencies[extractAgencyCode(agenceName)];
    return {
      agenceName,
      nbActualisations: formatNb(total),
      totalUsersAgency: formatNb(totalUsersAgency),
      percentage: `${((total / totalUsersAgency) * 100).toFixed(2)} %`,
    };
  });

  return (
    <ZnTable
      rowKey="id"
      size="small"
      style={{ backgroundColor: 'white' }}
      columns={columns}
      dataSource={data}
    />
  );
}
