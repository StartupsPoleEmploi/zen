// @flow
import React from 'react';

import ZnTable from '../../../../../components/ZnTable';

const numberFormatter = Intl.NumberFormat('fr-Fr');
function formatNb(nb) {
  return numberFormatter.format(nb);
}

type Props = {
  byRegionTotal: Array<Array>,
  usersGlobalRepartition: Object,
}
export default function TableByRegion({ byRegionTotal, usersGlobalRepartition }: Props) {
  const columns = [
    {
      title: 'Région',
      dataIndex: 'regionName',
      key: 'regionName',
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
      dataIndex: 'totalUsersRegion',
      key: 'totalUsersRegion',
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

  const data = byRegionTotal.map(([regionName, total]) => {
    const totalUsersRegion = usersGlobalRepartition.regions[regionName];
    return {
      regionName,
      nbActualisations: formatNb(total),
      totalUsersRegion: formatNb(totalUsersRegion),
      percentage: `${((total / totalUsersRegion) * 100).toFixed(2)} %`,
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
