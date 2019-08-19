import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'
import Autorenew from '@material-ui/icons/Autorenew'
import Check from '@material-ui/icons/Check'
import CheckBoxOutlineBlank from '@material-ui/icons/CheckBoxOutlineBlank'
import Info from '@material-ui/icons/InfoOutlined'
import Eye from '@material-ui/icons/RemoveRedEye'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import styled from 'styled-components'

import { primaryBlue } from '../../constants'
import TooltipOnFocus from '../Generic/TooltipOnFocus'
import CustomColorButton from '../Generic/CustomColorButton'
import DocumentDialog from '../Generic/documents/DocumentDialog'

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

const BaseStyledFormLabel = styled(FormLabel)`
  && {
    display: flex;
    border-radius: 1rem;
    align-items: center;
  }
`

const StyledFormLabel = styled(BaseStyledFormLabel)`
  justify-content: flex-end;
`

const SideFormLabel = styled(BaseStyledFormLabel)`
  && {
    width: 12rem;
    background-color: transparent;
    padding-left: 1rem;
  }
`

const Container = styled.div`
  display: flex;
  align-items: center;
`

const InfoIcon = styled(Info)`
  margin-left: 0.5rem;
`

const EyeIcon = styled(Eye)`
  margin-right: 2rem;
`

const ViewButton = styled(Button)`
  && {
    justify-content: space-between;
    white-space: nowrap;
    height: 3.2rem;
    min-height: 3.2rem;
  }
`

const ErrorTypography = styled(Typography).attrs({ variant: 'caption' })`
  && {
    color: red;
    padding-right: 1rem;
  }
`

const SideButton = styled(Button)`
  & > * {
    flex-direction: column;
    text-transform: uppercase;
    text-align: center;
    font-size: 1.1rem;
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
    removePageFromFile: PropTypes.func.isRequired,
    allowSkipFile: PropTypes.bool,
    skipFile: PropTypes.func.isRequired,
    type: PropTypes.oneOf([employerType, infosType]),
    infoTooltipText: PropTypes.string,
    employerId: PropTypes.number,
    employerDocType: PropTypes.string,
    showTooltip: PropTypes.bool,
  }

  static defaultProps = {
    showTooltip: false,
  }

  static types = { employer: employerType, info: infosType }

  state = {
    showPDFViewer: false,
  }

  componentDidUpdate = (prevProps) => {
    if (
      prevProps.isLoading &&
      !this.props.isLoading &&
      this.props.fileExistsOnServer &&
      !this.props.error &&
      !this.state.showPDFViewer &&
      this.props.canUsePDFViewer
    ) {
      // Open the modal if a file was just updated (previously loading, now not, )
      // TODO the whole Dialog logic should perhaps be moved to the parent component
      // to be fully controlled without need for this
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ showPDFViewer: true })
    }
  }

  renderFileField(fileInput, showTooltip, id) {
    if (!showTooltip) return fileInput
    if (!id) throw new Error(`id is undefined`)

    return (
      <TooltipOnFocus
        useHover
        tooltipId={`file[${id}]`}
        content="Formats acceptés: .png, .jpg, .jpeg, .pdf, .doc, .docx"
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

  computePDFUrl = () => {
    const { id, type } = this.props

    // Note: if employer file is missing, there is no data, so we have to check that the id exists
    // But for infosType, the id exists
    if (type === employerType && !id) return null
    if (type === infosType && !this.props.fileExistsOnServer) return null

    return type === employerType
      ? `/api/employers/files?documentId=${id}`
      : `/api/declarations/files?declarationInfoId=${id}`
  }

  addFile = (file) =>
    this.props.submitFile({
      isAddingFile: true,
      file,
      documentId: this.props.id,
      type: this.props.type,
      employerId: this.props.employerId,
      employerDocType: this.props.employerDocType,
    })

  removePage = (pageNumberToRemove) =>
    this.props.removePageFromFile({
      pageNumberToRemove,
      type: this.props.type,
      documentId: this.props.id,
      employerId: this.props.employerId,
      employerDocType: this.props.employerDocType,
    })

  skipFile = () =>
    this.props.skipFile({
      type: this.props.type,
      documentId: this.props.id,
      employerId: this.props.employerId,
      employerDocType: this.props.employerDocType,
    })

  togglePDFViewer = () =>
    this.setState((state) => ({ showPDFViewer: !state.showPDFViewer }))

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
      allowSkipFile,
      infoTooltipText,
      showTooltip,
      employerId,
    } = this.props

    const { showPDFViewer } = this.state

    const formattedError = <ErrorTypography>{error}</ErrorTypography>

    const hiddenInput = (
      <input
        accept=".png, .jpg, .jpeg, .pdf, .doc, .docx"
        style={{ display: 'none' }}
        type="file"
        onChange={({
          target: {
            files: [file],
          },
        }) => this.submitFile(file)}
      />
    )

    const url = this.computePDFUrl()

    let sideFormLabelContent = null
    if (isTransmitted) {
      sideFormLabelContent = (
        <SideButton disabled>
          <Check />
          Transmis à Pôle Emploi
        </SideButton>
      )
    } else if (fileExistsOnServer) {
      sideFormLabelContent = (
        <Fragment>
          {hiddenInput}
          <SideButton component="span" size="small">
            <Autorenew style={{ transform: 'rotate(-90deg)' }} />
            Remplacer le document
          </SideButton>
        </Fragment>
      )
    } else if (allowSkipFile) {
      sideFormLabelContent = (
        <TooltipOnFocus
          useHover
          content="Cochez cette case si vous avez transmis ce justificatif à Pôle Emploi par d'autres moyens que Zen."
        >
          <SideButton onClick={this.skipFile}>
            <CheckBoxOutlineBlank />
            {/* eslint-disable-next-line no-irregular-whitespace */}
            Transmis à Pôle Emploi
          </SideButton>
        </TooltipOnFocus>
      )
    }

    const documentButton = canUsePDFViewer ? (
      <ViewButton
        variant="outlined"
        data-pdf-url={url}
        onClick={this.togglePDFViewer}
        className="show-file"
      >
        <EyeIcon />
        {showPDFViewer ? 'Fermer la visionneuse' : 'Voir le justificatif'}
      </ViewButton>
    ) : (
      <ViewButton
        variant="outlined"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="show-file"
      >
        <EyeIcon />
        Voir le justificatif
      </ViewButton>
    )

    const uploadInput = (
      <CustomColorButton
        aria-describedby={`file[${id}]`}
        component="span"
        size="small"
      >
        Parcourir
      </CustomColorButton>
    )

    return (
      <Fragment>
        <StyledContainer>
          <StyledListItem
            style={{
              borderColor:
                fileExistsOnServer || isTransmitted ? primaryBlue : '#df5555',
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
                  {error
                    ? formattedError
                    : fileExistsOnServer && documentButton}
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
                </Container>
              )}
            </FormControl>
          </StyledListItem>
          <SideFormLabel>{sideFormLabelContent}</SideFormLabel>
        </StyledContainer>

        <DocumentDialog
          isOpened={showPDFViewer}
          onCancel={this.togglePDFViewer}
          addFile={this.addFile}
          removePage={this.removePage}
          submitFile={this.submitFile}
          error={error}
          pdfUrl={url}
          fileExistsOnServer={fileExistsOnServer}
          isLoading={isLoading}
        />
      </Fragment>
    )
  }
}

export default DocumentUpload
