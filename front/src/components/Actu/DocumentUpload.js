import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'
import CheckBoxOutlineBlank from '@material-ui/icons/CheckBoxOutlineBlank'
import Info from '@material-ui/icons/InfoOutlined'
import Eye from '@material-ui/icons/RemoveRedEye'
import NoteAdd from '@material-ui/icons/NoteAdd'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import styled from 'styled-components'

import { primaryBlue } from '../../constants'
import TooltipOnFocus from '../Generic/TooltipOnFocus'

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`

const StyledListItem = styled(ListItem)`
  && {
    flex: 1 1 30rem;
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
    flex-wrap: wrap;
    border-width: 1px;
    border-style: solid;
    border-left-width: 0.8rem;
    border-radius: 0.5rem;
    margin-top: 1rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 0 0.5rem 0.1rem #eee;
  }
`

const StyledFormLabel = styled(FormLabel)`
  display: flex;
  border-radius: 1rem;
  align-items: center;
  justify-content: flex-end;
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`

const InfoIcon = styled(Info)`
  margin-left: 0.5rem;
`

const EyeIcon = styled(Eye)`
  margin-right: 2rem;
`

const CheckBoxOutlineBlankIcon = styled(CheckBoxOutlineBlank)`
  margin-right: 2rem;
`

const NoteAddIcon = styled(NoteAdd)`
  margin-right: 2rem;
`

const ActionButton = styled(Button)`
  && {
    justify-content: flex-start;
    min-height: 3.2rem;
    margin-top: 0.1rem;
  }
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
    infoTooltipText: PropTypes.string,
    employerId: PropTypes.number,
    employerDocType: PropTypes.string,
    showPreview: PropTypes.func.isRequired,
    showTooltip: PropTypes.bool,
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
      infoTooltipText,
      showTooltip,
      employerId,
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
        variant="contained"
        onClick={this.showPreview}
        className="show-file"
        color="primary"
      >
        <EyeIcon />
        Voir, modifier ou valider le justificatif
      </ActionButton>
    ) : null

    const uploadInput = (
      <ActionButton
        aria-describedby={`file[${id}]`}
        variant="contained"
        color="primary"
        component="span"
        style={{ flex: 1 }}
      >
        <NoteAddIcon />
        Parcourir
      </ActionButton>
    )

    return (
      <Fragment>
        <StyledContainer>
          <StyledListItem
            style={{
              borderColor: isTransmitted ? primaryBlue : '#df5555',
            }}
          >
            <ListItemText
              primary={
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <b>{label}</b>
                    {caption && (
                      <Fragment>
                        <br />
                        <Typography variant="caption">{caption}</Typography>
                      </Fragment>
                    )}
                    {(fileExistsOnServer || isTransmitted) && (
                      <Fragment>
                        <br />
                        <Typography
                          variant="caption"
                          color={isTransmitted ? '' : 'error'}
                        >
                          {isTransmitted
                            ? fileExistsOnServer
                              ? '✅ Justificatif validé et transmis'
                              : '✅ Justificatif directement transmis à pole-emploi.fr'
                            : '⚠️ Justificatif à valider'}
                        </Typography>
                      </Fragment>
                    )}
                  </div>
                  {infoTooltipText && (
                    <TooltipOnFocus
                      content={infoTooltipText}
                      useHover
                      enterDelay={0}
                      leaveDelay={1500}
                      enterTouchDelay={0}
                      leaveTouchDelay={3000}
                    >
                      <InfoIcon />
                    </TooltipOnFocus>
                  )}
                </div>
              }
            />
            <FormControl>
              {isLoading ? (
                <CircularProgress />
              ) : (
                <Container>
                  {error && <ErrorTypography>{error}</ErrorTypography>}

                  {fileExistsOnServer && !isTransmitted && viewDocumentButton}

                  {!fileExistsOnServer && !isTransmitted && (
                    <StyledFormLabel>
                      {hiddenInput}
                      {this.renderFileField(
                        uploadInput,
                        showTooltip,
                        employerId,
                      )}
                    </StyledFormLabel>
                  )}

                  {!isTransmitted && (
                    <TooltipOnFocus
                      useHover
                      content="Cochez cette case si vous avez transmis ce justificatif à Pôle Emploi par d'autres moyens que Zen."
                    >
                      <ActionButton
                        variant="outlined"
                        aria-describedby={`file[${id}]`}
                        onClick={this.skipFile}
                      >
                        <CheckBoxOutlineBlankIcon />
                        Déjà transmis à Pôle Emploi
                      </ActionButton>
                    </TooltipOnFocus>
                  )}
                </Container>
              )}
            </FormControl>
          </StyledListItem>
        </StyledContainer>
      </Fragment>
    )
  }
}

export default DocumentUpload
