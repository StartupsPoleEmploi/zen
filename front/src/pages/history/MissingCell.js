import React from 'react';
import { Typography, Link, Box } from '@material-ui/core';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import DoneIcon from '@material-ui/icons/Done';
import VisibilityIcon from '@material-ui/icons/VisibilityOutlined';

import PriorityHighIcon from '@material-ui/icons/PriorityHighOutlined';
import { getDeclarationMissingFilesNb } from '../../lib/file';
import {
  intermediaryBreakpoint, mobileBreakpoint, primaryBlue, errorRed, errorOrange,
} from '../../constants';
import TooltipOnFocus from '../../components/Generic/TooltipOnFocus';

// prettier-ignore
const DOCUMENT_LABELS_FORMAT = {
  sickLeave: (n) => `${n} ${n > 1 ? 'feuilles maladies envoyées' : 'feuille maladie envoyée'}`,
  internship: (n) => `${n} ${n > 1 ? 'attestations de stage envoyées' : 'attestation de stage envoyée'}`,
  maternityLeave: (n) => `${n} ${n > 1 ? 'attestations de congé maternité envoyées' : 'attestation de congé maternité envoyée'}`,
  retirement: (n) => `${n} ${n > 1 ? 'attestations retraite envoyées' : 'attestation retraite envoyée'}`,
  invalidity: (n) => `${n} ${n > 1 ? 'attestations invalidité envoyées' : 'attestation invalidité envoyée'}`,
  employerCertificate: (n) => `${n} ${n > 1 ? 'attestations employeur envoyées' : 'attestation employeur envoyée'}`,
  salarySheet: (n) => `${n} ${n > 1 ? 'bulletins de salaire envoyés' : 'bulletin de salaire envoyé'}`,
};

const StyledMissingCell = styled.div`
    flex: 1;

    display: flex;
    align-items: center;
    padding: 1rem;
    height: 100%;
    border-left: solid 1px #ddd;
    justify-content: center;
    text-align: center;

    @media (max-width: ${intermediaryBreakpoint}) {
      padding: 2rem;
      border-left: none;
      border-top: solid 1px #ddd;
      justify-content: stretch;

      > div {
        width: 100%;
        text-align: left;
      }
    }

    @media (max-width: ${mobileBreakpoint}) {
      justify-content: left;
      padding-top: 2rem;
      padding-bottom: 2rem;
      padding-left: 0;
    }
  }
`;

const Ul = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const StyledDoneIcon = styled(DoneIcon)`
  && {
    margin-right: 1rem;
    vertical-align: bottom;
    color: green;
  }
`;

const BoxMissingDocs = styled(Box)`
  flex-direction: column;
`;

const BoxLine = styled(Typography)`
  display: flex;
  align-items: center;
  width: 100%;

  svg {
    margin-left: 2.3rem;
  }

  &:first-child {
    margin-bottom: 1rem;
  }
`;

const MissingCell = ({ lastMonthId, width, declaration }) => {
  const missingFilesNumber = getDeclarationMissingFilesNb(declaration);

  function renderAllFilesSend() {
    const filesByType = {};

    declaration.infos.forEach(({ type }) => {
      if (filesByType[type] === undefined) filesByType[type] = 1;
      else {
        filesByType[type] += 1;
      }
    });

    declaration.employers.forEach((employer) => {
      employer.documents.forEach(({ type }) => {
        if (filesByType[type] === undefined) filesByType[type] = 1;
        else {
          filesByType[type] += 1;
        }
      });
    });

    const totalFilesSent = Object.entries(filesByType).length;

    const tooltipContent = (
      <Ul>
        {Object.entries(filesByType).map(([type, number]) => (
          <li key={type}>{DOCUMENT_LABELS_FORMAT[type](number)}</li>
        ))}
      </Ul>
    );

    return (
      <TooltipOnFocus content={tooltipContent}>
        <BoxLine style={{ paddingLeft: width === 'xs' ? '3.2rem ' : null }}>
          <Box flex={1}>
            {width !== 'xs' && missingFilesNumber === 0 && <StyledDoneIcon />}
            {totalFilesSent === 1 && `${totalFilesSent} justificatif envoyé`}
            {totalFilesSent > 1 && `${totalFilesSent} justificatifs envoyés`}
          </Box>
          <VisibilityIcon style={{ color: primaryBlue, marginRight: '1rem' }} />
          <Typography>Visualiser</Typography>
        </BoxLine>
      </TooltipOnFocus>
    );
  }

  return (
    <StyledMissingCell className="text">

      <BoxMissingDocs display="flex">
        {renderAllFilesSend()}
        {missingFilesNumber !== 0 && (
        <BoxLine>
          <Box flex={1}>
            <Link
              href="/files"
              style={{ paddingLeft: width === 'xs' ? '3.2rem' : null, color: errorOrange }}
            >
              {missingFilesNumber}
              {' '}
              {missingFilesNumber === 1 ?
                'justificatif manquant' :
                'justificatifs manquants'}
            </Link>
          </Box>
          <PriorityHighIcon style={{ color: errorRed, marginRight: '1rem' }} />
          <Typography>Ajouter</Typography>
        </BoxLine>
        )}
      </BoxMissingDocs>
    </StyledMissingCell>
  );
};

MissingCell.propTypes = {
  declaration: PropTypes.object,
  lastMonthId: PropTypes.number.isRequired,
  width: PropTypes.string.isRequired,
};

export default MissingCell;
