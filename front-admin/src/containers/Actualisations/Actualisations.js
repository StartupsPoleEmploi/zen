import React, { useState, useEffect } from 'react';
import superagent from 'superagent';
import moment from 'moment';
import {
  Button, Icon, Row, Col,
} from 'antd';

import ZnContent from '../../components/ZnContent';
import ZnHeader from '../../components/ZnHeader';
import ActualisationTable from './components/ActualisationTable';


export default function Actualisations() {
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonthId, setSelectedMonthId] = useState(null);
  const [declarations, setDeclarations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    superagent.get('/zen-admin-api/declarationsMonths').then(({ body }) => {
      setAvailableMonths(body);
      setSelectedMonthId(body[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedMonthId) return;
    setIsLoading(true);

    superagent
      .get(`/zen-admin-api/declarations?monthId=${selectedMonthId}`)
      .then(({ body }) => {
        setDeclarations(body);
        setIsLoading(false);
      });
  }, [selectedMonthId]);

  return (
    <div style={{ textAlign: 'center' }}>
      <ZnHeader title="Actualisations" />

      <ZnContent>
        <Row type="flex" justify="end">
          <Button href="/zen-admin-api/users-with-declaration/csv">
            <Icon type="download" />
            {' '}
            Utisateurs avec au moins une actualisation
          </Button>
        </Row>
        <div>
          <select onChange={(event) => setSelectedMonthId(event.target.value)}>
            {availableMonths.map((month) => (
              <option key={month.id} value={month.id}>
                {moment(month.month).format('MMMM YYYY')}
              </option>
            ))}
          </select>
        </div>
        {isLoading ? (
          <p>Loading…</p>
        ) : (
          <>
            <Row gutter={16}>
              <Col xl={8} sm={24}>
                <h2>
                  {`Débutées : ${declarations.length}`}
                </h2>
              </Col>
              <Col xl={8} sm={24}>
                <h2>
                  {`Terminées : ${declarations.filter((e) => e.hasFinishedDeclaringEmployers).length}`}
                </h2>
              </Col>
              <Col xl={8} sm={24}>
                <h2>
                  {`Documents validés : ${declarations.filter(({ isFinished }) => isFinished).length}`}
                </h2>
              </Col>
            </Row>
            <ActualisationTable declarations={declarations} />
          </>
        )}
      </ZnContent>
    </div>
  );
}

Actualisations.propTypes = {};
