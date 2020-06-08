import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import superagent from 'superagent';
import { ColumnChart } from 'react-chartkick';
import moment from 'moment';

import { useUseradmin } from '../../../../common/contexts/useradminCtx';
import './global.css';

function formatFrenchDate(date) {
  return moment(date).format('DD-MM-YYYY');
}
function formatFrenchDateMonth(date) {
  return moment(date).format('MMMM-YYYY');
}

function Global() {
  const [values, setValues] = useState(null);
  const { logoutIfNeed } = useUseradmin();

  useEffect(() => {
    async function fetchData() {
      await superagent.get('/zen-admin-api/metrics/global')
        .then(({ body }) => setValues(body))
        .catch(logoutIfNeed);
    }
    fetchData();
  }, [logoutIfNeed]);

  if (!values) return <Spin />;

  const declatationsByMonthData = values.declarationsDoneByMonth.map(
    ({ count, declarationMonth }) => [
      formatFrenchDateMonth(declarationMonth.month),
      count,
    ],
  );

  const firstLoginByMonthData = values.userRegistedByMonth.map(
    ({ count, month }) => [formatFrenchDateMonth(month), count],
  );

  return (
    <div id="admin-global">
      <section>
        <p>
          Zen a actuellement
          {' '}
          <strong>
            {values.globalUserRegistered}
            {' '}
utilisateurs
          </strong>
          {' '}
          enregistrés (au moins une connexion)
        </p>
      </section>
      <section>
        <p>
          Depuis sa création, il y a eu
          {' '}
          <strong>
            {values.globalDeclarationsDone}
            {' '}
actualisations
          </strong>
          {' '}
faites
          sur Zen
        </p>
      </section>

      <section>
        <ColumnChart
          title="Nombre d'actualisations par mois"
          data={declatationsByMonthData}
          download={`actualisations-par-mois-${formatFrenchDate(new Date())}`}
        />
      </section>

      <section>
        <ColumnChart
          title="Nombre de 1ère connexion par mois"
          data={firstLoginByMonthData}
          download={`premiere-connexion-par-mois-${formatFrenchDate(
            new Date(),
          )}`}
        />
      </section>
    </div>
  );
}

export default Global;
