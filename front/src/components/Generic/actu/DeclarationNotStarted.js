import React, { useState, useEffect } from 'react';
import { Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import superagent from 'superagent';
import moment from 'moment';
import PriorityHighIcon from '@material-ui/icons/PriorityHigh';

import ActuButton from './ActuButton';
import catchMaintenance from '../../../lib/catchMaintenance';
import { ActuStatusBlock } from './ActuGenericComponent';

const DeclarationNotStarted = () => {
  const [actuEndDate, setActuEndDate] = useState(null);

  useEffect(() => {
    superagent
      .get('/api/declarationMonths/current-declaration-month')
      .then(({ body: { endDate } }) => {
        // Note: the endDate in database is the 16th (at midnight) of the month
        // So we need to the display the day before as last day for declaration
        setActuEndDate(
          moment(endDate)
            .subtract(1, 'day')
            .format('DD MMMM YYYY'),
        );
      })
      .catch(catchMaintenance);
  }, []);

  return (
    <div>
      <ActuStatusBlock
        title="Actualisation non débutée"
        Icon={<PriorityHighIcon style={{ color: '#ff6237' }} />}
      >
        {actuEndDate && (
          <Typography>
            Vous avez jusqu'au
            {' '}
            <strong>{actuEndDate}</strong>
            {' '}
            pour vous
            actualiser.
          </Typography>
        )}
      </ActuStatusBlock>

      <ActuButton to="/actu" component={Link} title="Je m'actualise">
        Je m'actualise
      </ActuButton>
    </div>
  );
};

export default DeclarationNotStarted;
