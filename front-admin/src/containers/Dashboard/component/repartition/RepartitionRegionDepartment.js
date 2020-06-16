/* eslint-disable react/jsx-one-expression-per-line */
// @flow
import React, { useEffect, useState } from 'react';
import superagent from 'superagent';
import slug from 'slug';
import { Spin, Button } from 'antd';

import { useUseradmin } from '../../../../common/contexts/useradminCtx';
import { getAgence } from '../../../../common/agencesInfos';
import TableByAgence from './Tables/TableByAgence';
import TableByDepartment from './Tables/TableByDepartment';
import TableByRegion from './Tables/TableByRegion';
import generateExecFromJson from './generateExcel';

import './Repartition.css';


function sort(obj) {
  return Object.entries(obj).sort(
    ([, r1Total], [, r2Total]) => r2Total - r1Total,
  );
}

const numberFormatter = Intl.NumberFormat('fr-Fr');
function formatNb(nb) {
  return numberFormatter.format(nb);
}

type Props = {
  usersGlobalRepartition: Object,
  region: string,
  department: string,
  declarationMonth: Object,
}

function RepartitionRegionDepartment({
  usersGlobalRepartition,

  region,
  department,
  declarationMonth,
}: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [exportOnGoing, setExportOnGoing] = useState(false);
  const [franceTotal, setFranceTotal] = useState(0);
  const [byRegionTotal, setByRegion] = useState({});
  const [byDepartmentTotal, setByDepartment] = useState({});
  const [byAgencyTotal, setByAgency] = useState({});
  const { logoutIfNeed } = useUseradmin();

  function computeDeclarationHierarchy(declarations) {
    const regionsTotal = {};
    const departmentsTotal = {};
    const agencyTotal = {};

    declarations.forEach(({ user }) => {
      const { region: reg, departement: dep, nomAgence } = getAgence(
        user.agencyCode,
      );

      // Region
      if (!regionsTotal[reg]) regionsTotal[reg] = 0;
      regionsTotal[reg] += 1;

      // Department
      if (!departmentsTotal[dep]) departmentsTotal[dep] = 0;
      departmentsTotal[dep] += 1;

      // Agency
      const name = `${user.agencyCode} - ${nomAgence}`; // The '-' is important
      if (!agencyTotal[name]) agencyTotal[name] = 0;
      agencyTotal[name] += 1;
    });

    setFranceTotal(declarations.length);
    setByRegion(sort(regionsTotal));
    setByDepartment(sort(departmentsTotal));
    setByAgency(sort(agencyTotal));
    setTimeout(() => setIsLoading(false), 500);
  }

  useEffect(() => {
    // prettier-ignore
    async function fetchData() {
      setIsLoading(true);
      let url = `/zen-admin-api/declarations?monthId=${declarationMonth.id}&onlyDone=true`;
      if (department) url = `/zen-admin-api/repartition/department?department=${slug(department, { lower: true })}&monthId=${declarationMonth.id}`;
      else if (region) url = `/zen-admin-api/repartition/region?region=${slug(region, { lower: true })}&monthId=${declarationMonth.id}`;

      await superagent.get(url)
        .then(({ body }) => computeDeclarationHierarchy(body))
        .catch(logoutIfNeed);
    }
    fetchData();
  }, [region, department, declarationMonth, logoutIfNeed]);

  function exportAsExcel() {
    setExportOnGoing(true);
    generateExecFromJson({
      usersGlobalRepartition,
      byAgencyTotal,
      byDepartmentTotal,
      byRegionTotal,
      filtre: { region, department, declarationMonth },
    });
    setExportOnGoing(false);
  }

  if (isLoading) return <Spin />;

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginBottom: '2rem',
        }}
      >
        <div style={{ flex: 1 }}>
          <Button onClick={exportAsExcel}>
            {exportOnGoing ? <Spin /> : 'Exporter comme excel'}
          </Button>
        </div>


        {region && !department && (
          <div style={{ flex: 1 }}>
            <Button
              target="_blank"
              href={`/zen-admin-api/repartition/unregistered-users-region/csv?monthId=${
                declarationMonth.id
              }&region=${slug(region, { lower: true })}`}
            >
              Télécharger la liste des assistantes maternelles de {region} ne
              s'étant jamais connectées à Zen
            </Button>
          </div>
        )}
      </div>

      <div id="pdf-content">
        <h1>
          Répartition pour
          {department ? ` le département ${department}` : null}
          {region && !department ? ` la region ${region}` : null}
          {!region && !department ? ' la France entière' : null}
        </h1>

        {/* No region selected ? we can display the repartition for all the regions */}
        {!region && (
          <>
            <h2 className="h2">France entière</h2>
            <p>
              Total de <strong>{formatNb(franceTotal)}</strong> actualisations
              <br />
              sur un total de{' '}
              <strong>
                {formatNb(usersGlobalRepartition.franceTotal)} assistantes
                maternelles
              </strong>{' '}
              (
              {(
                (franceTotal / usersGlobalRepartition.franceTotal)
                * 100
              ).toFixed(2)}
              %)
            </p>

            <h2 className="h2">Par régions</h2>
            <p className="subtitle">
              Les régions sans actualisation ne sont pas listées
            </p>
            <TableByRegion
              byRegionTotal={byRegionTotal}
              usersGlobalRepartition={usersGlobalRepartition}
            />
          </>
        )}

        {/* No department selected ? we can display the repartition for all the departments */}
        {!department && (
          <>
            <h2 className="h2">Par département</h2>
            <p className="subtitle">
              Les départements sans actualisation ne sont pas listés
            </p>
            <TableByDepartment
              byDepartmentTotal={byDepartmentTotal}
              usersGlobalRepartition={usersGlobalRepartition}
            />
          </>
        )}

        <h2 className="h2">Par agence</h2>
        <p className="subtitle">
          Les agences sans actualisation ne sont pas listées
        </p>
        <TableByAgence
          byAgencyTotal={byAgencyTotal}
          usersGlobalRepartition={usersGlobalRepartition}
        />
      </div>
    </>
  );
}

export default RepartitionRegionDepartment;
