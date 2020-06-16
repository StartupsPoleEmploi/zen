import Excel from 'exceljs';

const CELL_ACTUALISATIONS = { header: 'Nb actualisations', key: 'nbActualisations', width: 14 };
const CELL_TOTAL = { header: 'Nb total Assmat', key: 'total', width: 13 };
const CELL_PERCENTAGE = {
  header: 'Pourcentage.', key: 'percentage', width: 12, style: { numFmt: '0.00%' },
};

function extractAgencyCode(agencyLabel) {
  return agencyLabel.split('-')[0].trim();
}

function $generateSheetAgency({ usersGlobalRepartition, byAgencyTotal, workbook }) {
  const worksheet = workbook.addWorksheet('Par agence');
  worksheet.columns = [
    { header: 'Agence', key: 'agenceName', width: 36 },
    CELL_ACTUALISATIONS,
    CELL_TOTAL,
    CELL_PERCENTAGE,
  ];

  byAgencyTotal.forEach(([agenceName, nbActualisations]) => {
    const totalUsersAgency = usersGlobalRepartition.agencies[extractAgencyCode(agenceName)];
    worksheet.addRow({
      agenceName,
      nbActualisations,
      total: totalUsersAgency,
      percentage: nbActualisations / totalUsersAgency,
    });
  });
}

function $generateSheetDepartment({ usersGlobalRepartition, byDepartmentTotal, workbook }) {
  const worksheet = workbook.addWorksheet('Par département');
  worksheet.columns = [
    { header: 'Département', key: 'departmentName', width: 22 },
    CELL_ACTUALISATIONS,
    CELL_TOTAL,
    CELL_PERCENTAGE,
  ];

  byDepartmentTotal.forEach(([departmentName, nbActualisations]) => {
    const totalUsersDepartments = usersGlobalRepartition.departments[departmentName];
    worksheet.addRow({
      departmentName,
      nbActualisations,
      total: totalUsersDepartments,
      percentage: nbActualisations / totalUsersDepartments,
    });
  });
}

function $generateSheetRegion({ usersGlobalRepartition, byRegionTotal, workbook }) {
  const worksheet = workbook.addWorksheet('Par région');
  worksheet.columns = [
    { header: 'Département', key: 'regionName', width: 24 },
    CELL_ACTUALISATIONS,
    CELL_TOTAL,
    CELL_PERCENTAGE,
  ];

  byRegionTotal.forEach(([regionName, nbActualisations]) => {
    const totalUsersRegion = usersGlobalRepartition.regions[regionName];
    worksheet.addRow({
      regionName,
      nbActualisations,
      total: totalUsersRegion,
      percentage: nbActualisations / totalUsersRegion,
    });
  });
}


export default function generateExecFromJson({
  usersGlobalRepartition,
  byAgencyTotal,
  byDepartmentTotal,
  byRegionTotal,
  filtre: { region, department, declarationMonth },
}) {
  const workbook = new Excel.Workbook();

  $generateSheetRegion({ workbook, usersGlobalRepartition, byRegionTotal });
  $generateSheetDepartment({ workbook, usersGlobalRepartition, byDepartmentTotal });
  $generateSheetAgency({ workbook, usersGlobalRepartition, byAgencyTotal });

  const monthName = (new Date(declarationMonth.month)).toLocaleDateString('fr-FR', { month: 'long' });
  let fileName = `repartition-geographique-${monthName}`;
  if (region) fileName += `_${region}`;
  if (department) fileName += `_${department}`;

  workbook.xlsx.writeBuffer().then((data) => {
    const blob = new Blob([data],
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${fileName}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  });
}
