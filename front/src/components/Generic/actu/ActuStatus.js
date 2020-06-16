import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import moment from 'moment';
import superagent from 'superagent';
import DoneIcon from '@material-ui/icons/Done';
import { Typography } from '@material-ui/core';

import DeclarationFinished from './DeclarationFinished';
import DeclarationNotStarted from './DeclarationNotStarted';
import DeclarationClosed from './DeclarationClosed';
import DeclarationOnGoing from './DeclarationOnGoing';
import DeclarationImpossible from './DeclarationImpossible';
import { intermediaryBreakpoint } from '../../../constants';
import catchMaintenance from '../../../lib/catchMaintenance';
import { ActuStatusBlock } from './ActuGenericComponent';

const StyledActuStatus = styled.div`
  width: 100%;
  padding: 2rem;
  margin-bottom: 6rem;
  background-color: #f7f7f7;
`;

const SubTitle = styled(Typography).attrs({ variant: 'h5', component: 'h2' })`
  && {
    text-transform: uppercase;
    display: inline-block;
    padding-bottom: 0.5rem;
    margin-bottom: 2rem;
    font-size: 2rem;
    position: relative;

    @media (max-width: ${intermediaryBreakpoint}) {
      width: 100%;
    }
  }
`;

function ActuStatus({
  activeMonth,
  user,
  showTitle = true,
  declarations: allDeclarations,
  declaration: activeDeclaration,
}) {
  const [monthDateMoment, setMonthDateMoment] = useState(activeMonth ? moment(activeMonth) : null);

  useEffect(() => {
    if (activeMonth === null) {
      superagent
        .get('/api/declarationMonths/next-declaration-month')
        .then(({ body: { startDate } }) => {
          setMonthDateMoment(moment(new Date(startDate)));
        })
        .catch(catchMaintenance);
    }
  }, [activeMonth]);

  function renderActuStatus() {
    if (!activeMonth) {
      return <DeclarationClosed dateActuNextMonth={monthDateMoment} />;
    }

    if (user.hasAlreadySentDeclaration) {
      return (
        <ActuStatusBlock
          title="Actualisation déjà envoyée via pole-emploi.fr"
          Icon={<DoneIcon style={{ color: 'green' }} />}
        />
      );
    }

    if (activeMonth && !activeDeclaration && user.canSendDeclaration) {
      return <DeclarationNotStarted />;
    }

    if (!user.canSendDeclaration) {
      return <DeclarationImpossible />;
    }

    if (activeDeclaration.hasFinishedDeclaringEmployers) {
      return <DeclarationFinished declaration={activeDeclaration} />;
    }

    if (activeDeclaration) {
      return (
        <DeclarationOnGoing
          declaration={activeDeclaration}
          activeMonth={activeMonth}
        />
      );
    }
  }

  return (
    <StyledActuStatus>
      {showTitle && (
        <SubTitle>
          <b>Actualisation</b>
          {monthDateMoment && ` - ${monthDateMoment.format('MMMM YYYY')}`}
        </SubTitle>
      )}
      {renderActuStatus(user, allDeclarations, activeDeclaration, activeMonth)}
    </StyledActuStatus>
  );
}

ActuStatus.propTypes = {
  activeMonth: PropTypes.instanceOf(Date).isRequired,
  user: PropTypes.shape({
    firstName: PropTypes.string,
    hasAlreadySentDeclaration: PropTypes.bool,
    canSendDeclaration: PropTypes.bool,
    isBlocked: PropTypes.bool,
    email: PropTypes.string,
    needOnBoarding: PropTypes.bool,
    registeredAt: PropTypes.instanceOf(Date),
  }),
  declaration: PropTypes.object,
  showTitle: PropTypes.bool,
  declarations: PropTypes.arrayOf(PropTypes.object),
};

export default ActuStatus;
