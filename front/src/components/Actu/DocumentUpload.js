import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import FormLabel from '@material-ui/core/FormLabel'
import Typography from '@material-ui/core/Typography'
import CheckBoxOutlineBlank from '@material-ui/icons/CheckBoxOutlineBlank'
import Check from '@material-ui/icons/Check'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import styled from 'styled-components'

import TooltipOnFocus from '../Generic/TooltipOnFocus'
import { primaryBlue } from '../../constants'

const StyledContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;

  &:not(:last-child) {
    padding-bottom: 2rem;
  }
`

const StyledFormLabel = styled(FormLabel)`
  display: flex;
  border-radius: 1rem;
  align-items: center;
  justify-content: flex-end;
  flex: 1 0 auto;
  && {
    color: #000;
  }
`

const LabelsContainer = styled.div`
  flex: 0 1 auto;
  padding-right: 1rem;
  max-width: 18rem;
  width: 100%;
`

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
`

const ActionButton = styled(Button).attrs({
  variant: 'contained',
})`
  && {
    border-radius: 2rem;
  }
`

const CheckBoxOutlineBlankIcon = styled(CheckBoxOutlineBlank)`
  margin-right: 1rem;
`

const CheckIcon = styled(Check)`
  margin-right: 0.5rem;
`

const ErrorTypography = styled(Typography).attrs({ variant: 'caption' })`
  && {
    color: red;
    padding-right: 1rem;
  }
`

const employerType = 'employer'
const infosType = 'info'

export class DocumentUpload extends Component {
  static propTypes = {
    id: PropTypes.number,
    error: PropTypes.string,
    fileExistsOnServer: PropTypes.bool,
    canUsePDFViewer: PropTypes.bool,
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
  }

  static defaultProps = {
    showTooltip: false,
  }

  static types = { employer: employerType, info: infosType }

  renderFileField(fileInput, showTooltip, id) {
    if (!showTooltip) return fileInput

    return (
      <TooltipOnFocus
        useHover
        tooltipId={`file[${id}]`}
        content="Formats acceptés: .png, .jpg, .jpeg, .pdf"
      >
        {fileInput}
      </TooltipOnFocus>
    )
  }

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

  render() {
    const {
      id,
      caption,
      error,
      fileExistsOnServer,
      canUsePDFViewer,
      isLoading,
      isTransmitted,
      label,
      showTooltip,
      employerId,
      type,
      useLightVersion,
    } = this.props

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
    )

    const viewDocumentButton = canUsePDFViewer ? (
      <ActionButton
        onClick={this.showPreview}
        className="show-file"
        color="primary"
        fullWidth={useLightVersion}
      >
        Voir, modifier ou valider
      </ActionButton>
    ) : null

    const uploadInput = (
      <ActionButton
        aria-describedby={`file[${id}]`}
        color="primary"
        component="span"
        fullWidth={useLightVersion}
      >
        Parcourir
      </ActionButton>
    )

    return (
      <StyledContainer
        style={{
          flexDirection: useLightVersion ? 'column' : 'row',
          alignItems: useLightVersion ? 'flex-start' : 'center',
        }}
        className={`${type}-row`}
      >
        <LabelsContainer>
          <Typography>
            <b>{label}</b>
          </Typography>
          {caption && (
            <Typography variant="caption" component="div">
              {caption}
            </Typography>
          )}
          {fileExistsOnServer && !isTransmitted && (
            <Typography
              variant="caption"
              color={isTransmitted ? 'initial' : 'error'}
              component="div"
            >
              Justificatif à valider
            </Typography>
          )}
        </LabelsContainer>

        {isLoading ? (
          <CircularProgress />
        ) : (
          <div
            style={{
              display: 'flex',
              flex: 1,
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <ActionsContainer
              style={{
                border: useLightVersion ? '' : `2px dotted ${primaryBlue}`,
                alignItems: useLightVersion ? 'flex-start' : 'center',
                padding: useLightVersion ? '1rem 0' : '1rem',
              }}
            >
              {error && <ErrorTypography>{error}</ErrorTypography>}

              {isTransmitted ? (
                <ActionButton
                  disabled
                  style={{ backgroundColor: '#039C6D', color: 'white' }}
                >
                  <CheckIcon /> Envoyé
                </ActionButton>
              ) : !fileExistsOnServer ? (
                <StyledFormLabel
                  style={{ width: useLightVersion ? '100%' : 'auto' }}
                >
                  {!useLightVersion && (
                    <Fragment>Glissez / déposez ou&nbsp;</Fragment>
                  )}
                  {this.renderFileField(uploadInput, showTooltip, employerId)}
                  {hiddenInput}
                </StyledFormLabel>
              ) : (
                viewDocumentButton
              )}
            </ActionsContainer>

            <TooltipOnFocus
              useHover
              content="Cochez cette case si vous avez transmis ce justificatif à Pôle Emploi par d'autres moyens que Zen."
            >
              <Button
                aria-describedby={`file[${id}]`}
                onClick={this.skipFile}
                className="already-transmitted-button"
                style={{
                  width: '100%',
                  maxWidth: '15rem',
                  textAlign: 'left',
                  lineHeight: '2rem',
                }}
                size={useLightVersion ? 'medium' : 'small'}
                disabled={isTransmitted}
              >
                {!isTransmitted && (
                  <Fragment>
                    <CheckBoxOutlineBlankIcon />
                    Déjà transmis à Pôle Emploi
                  </Fragment>
                )}
              </Button>
            </TooltipOnFocus>
          </div>
        )}
      </StyledContainer>
    )
  }
}

export default DocumentUpload
