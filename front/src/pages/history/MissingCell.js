import React, { useState, useEffect } from 'react';
import {
  Typography, Link, Box, DialogContentText, RadioGroup, Radio, FormControlLabel, Button,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import DoneIcon from '@material-ui/icons/Done';
import VisibilityIcon from '@material-ui/icons/VisibilityOutlined';

import PriorityHighIcon from '@material-ui/icons/PriorityHighOutlined';
import moment from 'moment';
import { getDeclarationMissingFilesNb } from '../../lib/file';
import {
  intermediaryBreakpoint, mobileBreakpoint, primaryBlue, errorRed, errorOrange, darkBlue,
} from '../../constants';
import TooltipOnFocus from '../../components/Generic/TooltipOnFocus';
import { CustomDialog } from '../../components/Generic/CustomDialog';
import MainActionButton from '../../components/Generic/MainActionButton';
import { formattedDeclarationMonth } from '../../lib/date';
import { H3 } from '../../components/Generic/Titles';

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
const DOCUMENT_LABELS_FORMAT_SIMPLE = {
  sickLeave: 'Feuille maladie',
  internship: 'Attestation de stage',
  maternityLeave: 'Attestation de congé maternité',
  retirement: 'Attestation retraite',
  invalidity: 'Attestation invalidité',
  employerCertificate: 'Attestation employeur',
  salarySheet: 'Bulletin de salaire',
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

const StyledH3 = styled(H3)`
  && {
    font-size: 2.5rem;
    color: ${darkBlue};
    font-weight: normal;
    text-transform: capitalize;
    text-align: left;
    margin-bottom: 0.2rem;
  }
`;

const BoxLinePopup = styled(Box)`
  padding: 1.8rem 0;

  > strong {
    text-transform: uppercase;
  }
`;

const StyledRadioGroup = styled(RadioGroup)`
  && {
    flex-wrap: nowrap;
  }
`;

const StyledRadio = styled(Radio)`
  && {
    color: #000000;
  }
`;

const FormControl = styled(FormControlLabel)`
  border-bottom: 1px solid rgba(0,0,0,0.1);
`;

const VisualizeBt = styled(Button)`
  display: flex;
  margin-left: 0.5rem;
  
  svg {
    margin-left: 0;
  }
`;

const MissingCell = ({ width, declaration }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [radioSelected, setRadioSelected] = useState();
  const missingFilesNumber = getDeclarationMissingFilesNb(declaration);

  // find all document sent via ZEN
  let allDocSentWithZen = [];
  declaration.employers.forEach(({ documents, employerName }) => {
    allDocSentWithZen = allDocSentWithZen.concat(
      documents.filter(({ isTransmitted }) => isTransmitted)
        .map((d) => ({ ...d, employerName })),
    );
  });
  allDocSentWithZen = allDocSentWithZen.concat(declaration.infos
    .filter(({ isTransmitted }) => isTransmitted));

  console.log('allDocSentWithZen', allDocSentWithZen);

  // init radio button var
  useEffect(() => {
    if (!radioSelected && allDocSentWithZen.length !== 0) {
      setRadioSelected(allDocSentWithZen[0].file);
    }
  }, [radioSelected, allDocSentWithZen]);

  const onClosePopup = () => {
    setShowDialog(false);
  };

  const onShowFile = (file) => {
    window.open(`/api/files/${file}`);
  };

  function renderAllFilesSend() {
    const filesByType = {};

    allDocSentWithZen.forEach(({ type }) => {
      if (filesByType[type] === undefined) filesByType[type] = 1;
      else {
        filesByType[type] += 1;
      }
    });

    const totalFilesSent = allDocSentWithZen.length;

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
          {totalFilesSent !== 0 &&
           ((totalFilesSent === 1 && allDocSentWithZen[0].file) ||
           totalFilesSent > 1) && (
           <VisualizeBt
             onClick={totalFilesSent === 1 ?
               () => onShowFile(allDocSentWithZen[0].file) :
               () => setShowDialog(true)}
             aria-hidden="true"
           >
             <VisibilityIcon style={{ color: primaryBlue, marginRight: '1rem' }} />
             <Typography>Visualiser</Typography>
           </VisualizeBt>
          )}
        </BoxLine>
      </TooltipOnFocus>
    );
  }

  const renderAllFilesSendPopup = () => (
    <StyledRadioGroup
      value={radioSelected}
      onChange={(event) => setRadioSelected(event.target.value)}
    >
      {allDocSentWithZen.map(({
        type, startDate, file, employerName,
      }) => (
        <FormControl
          value={file}
          disabled={!file}
          control={(
            <StyledRadio
              style={{
                color: file === radioSelected ?
                  primaryBlue : 'rgba(0, 0, 0, 0.54)',
              }}
            />
            )}
          label={(
            <BoxLinePopup>
              {employerName && (
              <>
                <strong>{employerName}</strong>
                {' '}
              </>
              )}
              {DOCUMENT_LABELS_FORMAT_SIMPLE[type]}
              {' '}
              - transmis
              {' '}
              {file ? 'le' : 'via PE'}
              {' '}
              {moment(startDate).format('DD/MM/YYYY')}
            </BoxLinePopup>
            )}
        />
      ))}

    </StyledRadioGroup>
  );

  return (
    <StyledMissingCell>

      <BoxMissingDocs display="flex">
        {renderAllFilesSend()}
        {missingFilesNumber !== 0 && (
          <BoxLine>
            <Box flex={1}>
              <Link
                href="/files"
                style={{ paddingLeft: width === 'xs' ? '3.2rem' : null, color: errorOrange }}
                className="text"
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

      {showDialog && (
        <CustomDialog
          fullWidth
          content={(
            <DialogContentText style={{ color: 'black', padding: '1rem 2rem' }}>
              <StyledH3>{formattedDeclarationMonth(declaration.declarationMonth.month)}</StyledH3>
              {renderAllFilesSendPopup()}
            </DialogContentText>
          )}
          actions={(
            <>
              <MainActionButton primary={false} onClick={onClosePopup}>
                Annuler
              </MainActionButton>
              <MainActionButton
                variant="contained"
                onClick={() => onShowFile(radioSelected)}
                color="primary"
              >
                <VisibilityIcon style={{ color: 'white', marginRight: '1rem' }} />
                Visualiser
              </MainActionButton>
            </>
          )}
          title="Justificatifs envoyés"
          titleId="FileTransmittedToPE"
          isOpened
          onCancel={onClosePopup}
        />
      )}
    </StyledMissingCell>
  );
};

MissingCell.propTypes = {
  declaration: PropTypes.object,
  width: PropTypes.string.isRequired,
};

export default MissingCell;
