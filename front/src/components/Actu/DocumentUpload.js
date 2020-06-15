import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormLabel from '@material-ui/core/FormLabel';
import Typography from '@material-ui/core/Typography';
import CheckBoxOutlineBlank from '@material-ui/icons/CheckBoxOutlineBlank';
import Check from '@material-ui/icons/Check';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { withWidth } from '@material-ui/core';

import TooltipOnFocus from '../Generic/TooltipOnFocus';
import {
  helpColor,
  darkBlue,
  primaryBlue,
  intermediaryBreakpoint,
  mobileBreakpoint,
  errorOrange,
} from '../../constants';
import { hasFileBrokenByNavigator } from '../../lib/tools';

const StyledContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;

  &:not(:last-child) {
    padding-bottom: 2rem;
  }
`;

const StyledFormLabel = styled(FormLabel)`
  display: flex;
  border-radius: 1rem;
  align-items: center;
  justify-content: center;
  flex: 1 0 auto;
  && {
    color: #000;
  }

  @media (max-width: ${mobileBreakpoint}) {
    justify-content: flex-start;
    padding: 1rem 0;
  }
`;

const LabelsContainer = styled.div`
  flex: 0 1 auto;
  padding-right: 1rem;
  width: 20rem;

  @media (max-width: 1000px) {
    width: auto;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;

  @media (max-width: 1200px) {
    padding: 0;
  }

  @media (max-width: ${intermediaryBreakpoint}) {
    padding: 1rem;
  }
  @media (max-width: ${mobileBreakpoint}) {
    align-self: flex-start;
    padding: 1rem 0;
  }
`;

const ActionButton = styled(Button).attrs({
  variant: 'contained',
})`
  && {
    border-radius: 9rem;
    padding: 1rem 3rem;

    @media (max-width: 1200px) {
      padding: 1rem 2rem;
    }
    @media (max-width: ${intermediaryBreakpoint}) {
      padding: 1rem 3rem;
    }
  }
`;

const CheckBoxOutlineBlankIcon = styled(CheckBoxOutlineBlank)`
  color: ${primaryBlue};
  margin-right: 1rem;
  vertical-align: sub;
`;

const CheckIcon = styled(Check)`
  margin-right: 0.5rem;
`;

const ErrorTypography = styled(Typography).attrs({ variant: 'caption' })`
  && {
    color: red;
    padding-right: 1rem;
  }
`;

const Upper = styled.span`
  text-transform: uppercase;
  white-space: pre;
`;

const SecondBloc = styled.div`
  display: flex;

  @media (max-width: 1000px) {
    flex-direction: column;
  }
  @media (max-width: ${intermediaryBreakpoint}) {
    flex-direction: row;
    justify-content: center;
  }
  @media (max-width: ${mobileBreakpoint}) {
    justify-content: flex-start;
  }
`;

const Or = styled(Typography)`
  && {
    font-weight: bold;
    width: 5rem;
    text-align: center;
    align-self: center;
    margin-right: 1rem;

    @media (max-width: ${mobileBreakpoint}) {
      margin-right: 0;
    }
  }
`;

const MissingFileActionButton = styled(ActionButton)`
  && {
    background: transparent;
    border: solid 2px ${errorOrange};

    &:hover {
      background: transparent;
      border: solid 2px ${errorOrange};
    }
  }
`;

const InfoImg = styled(InfoOutlinedIcon)`
  && {
    color: ${helpColor};
    vertical-align: sub;
    margin-left: 0.5rem;
  }
`;
const DocumentZone = styled.div`
  display: flex;
  flex: 3;
  justify-content: space-around;
  width: 100%;

  @media (max-width: 1000px) {
    flex-direction: column;
  }
`;

const SkipFileSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: ${mobileBreakpoint}) {
    justify-content: flex-start;
  }
`;

const LabelTypography = styled(Typography)`
  @media (max-width: ${mobileBreakpoint}) {
    margin-bottom: 1.5rem;
  }
`;

const Dot = styled.span`
  color: ${primaryBlue};
  font-family: serif;
  font-size: 2.5rem;
  font-weight: bold;
  margin-right: 0;
`;

const employerType = 'employer';
const infosType = 'info';

export class DocumentUpload extends Component {
  static types = { employer: employerType, info: infosType }

  submitFile = (file) =>
    this.props.submitFile({
      file,
      documentId: this.props.id,
      type: this.props.type,
      employerId: this.props.employerId,
      employerDocType: this.props.employerDocType,
    })

  showPreview = () => this.props.showPreview(this.props.id)

  skipFile = () =>
    this.props.skipFile({
      type: this.props.type,
      documentId: this.props.id,
      employerId: this.props.employerId,
      employerDocType: this.props.employerDocType,
    })

  renderFileField(fileInput, showTooltip, id) {
    if (!showTooltip) return fileInput;

    if (hasFileBrokenByNavigator()) {
      return (
        <ErrorTypography className="upload-error">
          La version de votre navigateur est trop ancienne pour transmettre vos justificatifs.
          {' '}
          Nous vous invitons à le mettre à jour.
        </ErrorTypography>
      );
    }

    return (
      <TooltipOnFocus
        tooltipId={`file[${id}]`}
        content="Formats acceptés: .png, .jpg, .jpeg, .pdf"
      >
        {fileInput}
      </TooltipOnFocus>
    );
  }

  render() {
    const {
      id,
      caption,
      error,
      fileExistsOnServer,
      isLoading,
      isTransmitted,
      label,
      showTooltip,
      employerId,
      type,
      useLightVersion,
      width,
    } = this.props;

    const hiddenInput = (
      <input
        accept=".png, .jpg, .jpeg, .pdf"
        style={{ display: 'none' }}
        type="file"
        onChange={({
          target: {
            files: [file],
          },
        }) => this.submitFile(file)}
      />
    );

    const viewDocumentButton = (
      <div style={{ textAlign: 'center' }}>
        <MissingFileActionButton
          onClick={this.showPreview}
          className="show-file"
        >
          Voir, modifier ou valider
        </MissingFileActionButton>
        <Typography style={{ marginTop: '1rem', color: '#E5561E' }}>
          Justificatif à valider
        </Typography>
      </div>
    );

    const uploadInput = (
      <ActionButton
        aria-describedby={`file[${id}]`}
        color="primary"
        component="span"
      >
        Transmettre à Pôle emploi
      </ActionButton>
    );

    return (
      <StyledContainer
        style={{
          flexDirection: useLightVersion ? 'column' : 'row',
          alignItems: useLightVersion ? 'flex-start' : 'center',
        }}
        className={`${type}-row`}
      >
        <LabelsContainer>
          <LabelTypography>
            {width === 'xs' && <Dot>.</Dot>}
            {' '}
            <b>{label}</b>
          </LabelTypography>
          {caption && (
            <Typography
              variant="caption"
              component="div"
              style={{ fontSize: '1.6rem', color: darkBlue }}
            >
              {caption}
            </Typography>
          )}
        </LabelsContainer>

        {isLoading ? (
          <CircularProgress />
        ) : (
          <DocumentZone>
            <ActionsContainer>
              {error && (
              <ErrorTypography className="upload-error">
                {error}
              </ErrorTypography>
              )}

              {isTransmitted ? (
                <ActionButton
                  disabled
                  style={{ backgroundColor: '#039C6D', color: 'white' }}
                >
                  <CheckIcon />
                  {' '}
                  Envoyé
                </ActionButton>
              ) : !fileExistsOnServer ? (
                <StyledFormLabel
                  style={{
                    width: useLightVersion ? '100%' : 'auto',
                    textAlign: 'center',
                  }}
                >
                  {this.renderFileField(uploadInput, showTooltip, employerId)}
                  {hiddenInput}
                </StyledFormLabel>
              ) : (
                viewDocumentButton
              )}
            </ActionsContainer>

            {!isTransmitted && (
            <SecondBloc>
              <Or>OU</Or>
              <SkipFileSection>
                <Button
                  aria-describedby={`file[${id}]`}
                  onClick={this.skipFile}
                  className="already-transmitted-button"
                  style={{
                    textAlign: 'left',
                    lineHeight: '2rem',
                  }}
                  size={useLightVersion ? 'medium' : 'small'}
                  disabled={isTransmitted}
                >
                  <>
                    <Typography
                      style={{
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <CheckBoxOutlineBlankIcon style={{ width: '3rem' }} />
                      <div>
                        Pôle emploi
                        {' '}
                        <Upper>a déjà ce justificatif</Upper>
                      </div>
                    </Typography>
                  </>
                </Button>
                <TooltipOnFocus content="Cochez cette case si vous ou votre employeur avez déjà transmis ce justificatif à Pôle emploi.">
                  <InfoImg />
                </TooltipOnFocus>
              </SkipFileSection>
            </SecondBloc>
            )}
          </DocumentZone>
        )}
      </StyledContainer>
    );
  }
}

DocumentUpload.propTypes = {
  id: PropTypes.number,
  error: PropTypes.string,
  fileExistsOnServer: PropTypes.bool,
  label: PropTypes.string.isRequired,
  caption: PropTypes.string,
  isLoading: PropTypes.bool,
  isTransmitted: PropTypes.bool,
  submitFile: PropTypes.func.isRequired,
  skipFile: PropTypes.func.isRequired,
  type: PropTypes.oneOf([employerType, infosType]),
  employerId: PropTypes.number,
  employerDocType: PropTypes.string,
  showPreview: PropTypes.func.isRequired,
  showTooltip: PropTypes.bool,
  useLightVersion: PropTypes.bool.isRequired,
  width: PropTypes.string.isRequired,
};

DocumentUpload.defaultProps = {
  showTooltip: false,
};

export default withWidth()(DocumentUpload);
