import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import FormLabel from '@material-ui/core/FormLabel'
import Typography from '@material-ui/core/Typography'
import CheckBoxOutlineBlank from '@material-ui/icons/CheckBoxOutlineBlank'
import Check from '@material-ui/icons/Check'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'

import TooltipOnFocus from '../Generic/TooltipOnFocus'
import { helpColor, darkBlue, primaryBlue } from '../../constants'

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
  padding-right: 3rem;
  max-width: 18rem;
`

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const ActionButton = styled(Button).attrs({
  variant: 'contained',
})`
  && {
    border-radius: 9rem;
    padding: 1rem 3rem;
  }
`

const CheckBoxOutlineBlankIcon = styled(CheckBoxOutlineBlank)`
  color: ${primaryBlue};
  margin-right: 1rem;
  vertical-align: sub;
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

const Upper = styled.span`
  text-transform: uppercase;
`

const Or = styled(Typography)`
  && {
    font-weight: bold;
    width: 5rem;
    text-align: center;
    align-self: center;
  }
`

const InfoImg = styled(InfoOutlinedIcon)`
  && {
    color: ${helpColor};
    vertical-align: sub;
    margin-left: 0.5rem;
  }
`
const DocumentZone = styled.div`
  display: flex;
  flex: 3;
  justify-content: space-around;
  width: 100%;

  @media (max-width: 1000px) {
    flex-direction: column;
  }
`

const employerType = 'employer'
const infosType = 'info'

export class DocumentUpload extends Component {
  static types = { employer: employerType, info: infosType }

  renderFileField(fileInput, showTooltip, id) {
    if (!showTooltip) return fileInput

    return (
      <TooltipOnFocus
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

    const viewDocumentButton = (
      <ActionButton
        onClick={this.showPreview}
        className="show-file"
        color="primary"
      >
        Voir, modifier ou valider
      </ActionButton>
    )

    const uploadInput = (
      <ActionButton
        aria-describedby={`file[${id}]`}
        color="primary"
        component="span"
      >
        Transmettre à Pôle emploi
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
            <Typography
              variant="caption"
              component="div"
              style={{ fontSize: '1.6rem', color: darkBlue }}
            >
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
          <DocumentZone>
            <ActionsContainer
              style={{
                alignItems: useLightVersion ? 'flex-start' : 'center',
                alignSelf: 'center',
                padding: useLightVersion ? '1rem 0' : '1rem',
              }}
            >
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
                  <CheckIcon /> Envoyé
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
              <>
                <Or>OU</Or>
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
                    <Typography style={{ fontWeight: 'bold', display: 'flex' }}>
                      <CheckBoxOutlineBlankIcon style={{ width: '3rem' }} />
                      <div>
                        Pôle emploi <Upper>a déjà ce justificatif</Upper>
                        <TooltipOnFocus content="Cochez cette case si vous avez transmis ce justificatif à Pôle emploi par d'autres moyens que Zen.">
                          <InfoImg />
                        </TooltipOnFocus>
                      </div>
                    </Typography>
                  </>
                </Button>
              </>
            )}
          </DocumentZone>
        )}
      </StyledContainer>
    )
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
}

DocumentUpload.defaultProps = {
  showTooltip: false,
}

export default DocumentUpload
