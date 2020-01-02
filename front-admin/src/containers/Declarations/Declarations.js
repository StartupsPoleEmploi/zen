import React, { useEffect } from 'react';
import moment from 'moment';
import {
  Button, Icon, Row, Col, Select,
} from 'antd';

import { useDeclarations } from '../../common/contexts/declarationsCtx';
import ZnContent from '../../components/ZnContent';
import ZnHeader from '../../components/ZnHeader';
import DeclarationTable from './components/DeclarationTable';


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
    <div style={{ textAlign: 'center' }}>
      <ZnHeader title="Declarations" />

      <ZnContent>
        <Row type="flex" justify="end">
          <Button href="/zen-admin-api/users-with-declaration/csv">
            <Icon type="download" />
            {' '}
            Utisateurs avec au moins une declaration
          </Button>
        </Row>
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
              <Col xl={8} sm={24}>
                <h2>
                  {`Total : ${declarations.length}`}
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
            <DeclarationTable declarations={declarations} />
          </>
        )}
      </ZnContent>
    </div>
  );
}
