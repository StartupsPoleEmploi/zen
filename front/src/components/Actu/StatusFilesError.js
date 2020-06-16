import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

import MainActionButton from '../Generic/MainActionButton';

const InfoImg = styled(InfoOutlinedIcon)``;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;
const SubContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledArrowForwardIcon = styled(ArrowForwardIcon)`
  && {
    margin-left: 1rem;
  }
`;

const StatusFilesError = ({ hideDashboardLink = false }) => (
  <Container>
    <SubContainer>
      <InfoImg
        style={{
          color: '#ff622a',
          width: '4.5rem',
          height: '4.5rem',
          margin: '2rem',
        }}
      />

      <Typography>
        Le service d'envoi de justificatifs est
        {' '}
        <strong style={{ textTransform: 'uppercase' }}>indisponible</strong>
        .
        Nous vous invitons à réessayer ultérieurement.
      </Typography>
    </SubContainer>

    {!hideDashboardLink && (
      <MainActionButton
        to="/"
        component={Link}
        style={{
          display: 'flex',
          width: '30rem',
          margin: 'auto',
        }}
        primary
      >
        Retourner à la page d'accueil
        <StyledArrowForwardIcon />
      </MainActionButton>
    )}
  </Container>
);

StatusFilesError.propTypes = {
  hideDashboardLink: PropTypes.bool.isRequired,
};

export default StatusFilesError;
