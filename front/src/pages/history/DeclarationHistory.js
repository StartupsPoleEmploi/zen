import React from 'react';
import { Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import DoneIcon from '@material-ui/icons/Done';
import styled from 'styled-components';
import withWidth from '@material-ui/core/withWidth';

import moment from 'moment';
import { intermediaryBreakpoint, mobileBreakpoint } from '../../constants';
import MissingCell from './MissingCell';
import FileCell from './FileCell';

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-self: center;

  @media (max-width: ${intermediaryBreakpoint}) {
    grid-template-columns: 1fr;

    > div {
      justify-content: flex-start;
      padding-left: 0;
    }
  }
`;

const StyledDoneIcon = styled(DoneIcon)`
  && {
    margin-right: 1rem;
    vertical-align: bottom;
    color: green;
  }
`;

const Cell = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  padding: 1rem;
  height: 100%;
  @media (max-width: ${intermediaryBreakpoint}) {
    justify-content: center;
    padding: 2rem;
  }
  @media (max-width: ${mobileBreakpoint}) {
    justify-content: left;
    padding: 2rem 0;
  }
`;

function DeclarationHistory({ declaration, width }) {
  return (
    <Row>
      <Cell className="status">
        <Typography style={{ display: 'flex' }}>
          <StyledDoneIcon />
          <div>
            <strong style={{ textTransform: 'uppercase' }}>Actualisation envoyée</strong>
            <Typography>
              Le
              {' '}
              {moment(declaration.transmittedAt).format('DD MMMM YYYY')}
            </Typography>
          </div>
        </Typography>
      </Cell>

      <FileCell declaration={declaration} />
      <MissingCell
        declaration={declaration}
        width={width}
      />
    </Row>
  );
}

DeclarationHistory.propTypes = {
  declaration: PropTypes.object,
  width: PropTypes.string.isRequired,
};

export default withWidth()(DeclarationHistory);
