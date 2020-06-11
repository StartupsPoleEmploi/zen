// @flow
import React from 'react';

import ZnTable from '../../../../../components/ZnTable';

const numberFormatter = Intl.NumberFormat('fr-Fr');
function formatNb(nb) {
  return numberFormatter.format(nb);
}

type Props = {
  byDepartmentTotal: Array<Array>,
  usersGlobalRepartition: Object,
}
export default function TableByDepartment({ byDepartmentTotal, usersGlobalRepartition }: Props) {
  const columns = [
    {
      title: 'Département',
      dataIndex: 'departmentName',
      key: 'departmentName',
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
      dataIndex: 'totalUsersDepartments',
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

  const data = byDepartmentTotal.map(([departmentName, total]) => {
    const totalUsersDepartments = usersGlobalRepartition.departments[departmentName];
    return {
      departmentName,
      nbActualisations: formatNb(total),
      totalUsersDepartments: formatNb(totalUsersDepartments),
      percentage: `${((total / totalUsersDepartments) * 100).toFixed(2)} %`,
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
