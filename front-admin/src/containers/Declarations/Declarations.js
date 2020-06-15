import React, { useEffect } from 'react';
import moment from 'moment';
import {
  Row, Col, Select, Button,
} from 'antd';

import { useDeclarations } from '../../common/contexts/declarationsCtx';
import ZnContent from '../../components/ZnContent';
import ZnHeader from '../../components/ZnHeader';
import DeclarationTable from './components/DeclarationTable';

import './declarations.css';

export default function Declarations() {
  const {
    availableMonths,
    selectedMonthId,
    declarations,
    isLoading,
    // function
    setSelectedMonthId,
    init,
  } = useDeclarations();

  useEffect(() => {
    init();
  }, [init]);
  return (
    <div className="admin-declarations" style={{ textAlign: 'center' }}>
      <ZnHeader title="Declarations" />

      <ZnContent>
        <div>
          <Select style={{ width: '150px' }} value={selectedMonthId} onChange={setSelectedMonthId}>
            {availableMonths.map((month) => (
              <Select.Option key={month.id} value={month.id}>
                {moment(month.month).format('MMM YYYY')}
              </Select.Option>
            ))}
          </Select>
        </div>
        {isLoading ? (
          <p>Loading…</p>
        ) : (
          <>
            <Row gutter={16}>
              <Col xl={8} sm={24} style={{ margin: '2rem 0' }}>
                <h2>{`Débutées : ${declarations.length}`}</h2>

                <Button
                  type="link"
                  target="_blank"
                  href={`/zen-admin-api/declaration/users/csv?monthId=${selectedMonthId}`}
                >
                  Télécharger les actualisations débutées
                </Button>
              </Col>
              <Col xl={8} sm={24} style={{ margin: '2rem 0' }}>
                <h2>
                  {`Terminées : ${
                    declarations.filter((e) => e.hasFinishedDeclaringEmployers)
                      .length
                  }`}
                </h2>

                <Button
                  type="link"
                  target="_blank"
                  href={`/zen-admin-api/declaration/users/csv?condition=hasFinishedDeclaringEmployers&monthId=${selectedMonthId}`}
                >
                  Télécharger les actualisations avec employeurs déclarés
                </Button>
              </Col>
              <Col xl={8} sm={24} style={{ margin: '2rem 0' }}>
                <h2>
                  {`Documents validés : ${
                    declarations.filter(({ isFinished }) => isFinished).length
                  }`}
                </h2>

                <Button
                  type="link"
                  target="_blank"
                  href={`/zen-admin-api/declaration/users/csv?condition=isFinished&monthId=${selectedMonthId}`}
                  style={{ lineHeight: '1.1rem', maxWidth: '350px' }}
                >
                  Télécharger les actualisations avec employeurs déclarés et
                  tous les documents envoyées
                </Button>
              </Col>
            </Row>

            <DeclarationTable declarations={declarations} />
          </>
        )}
      </ZnContent>
    </div>
  );
}
