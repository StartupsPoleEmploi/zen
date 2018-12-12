import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormLabel from '@material-ui/core/FormLabel'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import Autorenew from '@material-ui/icons/Autorenew'
import Check from '@material-ui/icons/Check'
import CheckBoxOutlineBlank from '@material-ui/icons/CheckBoxOutlineBlank'
import Eye from '@material-ui/icons/RemoveRedEye'
import Warning from '@material-ui/icons/Warning'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import styled from 'styled-components'

import CustomColorButton from '../Generic/CustomColorButton'

// TODO merge with EmployerDocumentUpload

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`

const StyledListItem = styled(ListItem)`
  && {
    flex: 1 1 30rem;
    padding-top: 2rem;
    flex-wrap: wrap;
    border: 1px solid ${(props) => (props.hasDocument ? '#3e689b' : '#df5555')};
    border-left-width: 0.8rem;
    border-radius: 0.5rem;
    margin-top: 1rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 0 0.5rem 0.1rem #eee;
  }
`

const StyledFormLabel = styled(FormLabel)`
  && {
    display: flex;
    background-color: #f5f5f5;
    border-radius: 1rem;
    padding: 0 1rem;
    align-items: center;
  }
`

const SideFormLabel = StyledFormLabel.extend`
  && {
    width: 12rem;
    background-color: transparent;
  }
`

const StyledFormHelperText = styled(FormHelperText)`
  && {
    margin: 0 2rem;
  }
`

const Container = styled.div`
  display: flex;
  align-items: center;
`

const EyeIcon = styled(Eye)`
  margin-right: 2rem;
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

export class AdditionalDocumentUpload extends Component {
  static propTypes = {
    declarationId: PropTypes.number.isRequired,
    error: PropTypes.string,
    fileExistsOnServer: PropTypes.bool,
    label: PropTypes.string.isRequired,
    name: PropTypes.string,
    isLoading: PropTypes.bool,
    isTransmitted: PropTypes.bool,
    submitFile: PropTypes.func.isRequired,
    allowSkipFile: PropTypes.bool,
    skipFile: PropTypes.func.isRequired,
  }

  submitFile = ({ target: { files } }) =>
    this.props.submitFile({ file: files[0] })

  render() {
    const {
      declarationId,
      error,
      fileExistsOnServer,
      isLoading,
      isTransmitted,
      name,
      label,
      allowSkipFile,
      skipFile,
    } = this.props

    const formattedError = <ErrorTypography>{error}</ErrorTypography>

    const hiddenInput = (
      <input
        accept=".png, .jpg, .jpeg, .pdf, .doc, .docx"
        style={{ display: 'none' }}
        type="file"
        onChange={this.submitFile}
      />
    )

    return (
      <StyledContainer>
        <StyledListItem hasDocument={fileExistsOnServer}>
          <ListItemText primary={<b>{label}</b>} />
          <FormControl>
            {isLoading ? (
              <CircularProgress />
            ) : (
              <Container>
                {error
                  ? formattedError
                  : fileExistsOnServer && (
                      <Button
                        variant="outlined"
                        href={`/api/declarations/files?declarationId=${declarationId}&name=${name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <EyeIcon />
                        Voir l'attestation
                      </Button>
                    )}
                {!fileExistsOnServer && (
                  <StyledFormLabel>
                    {hiddenInput}
                    {!error && (
                      <Fragment>
                        <Warning />
                        <StyledFormHelperText>
                          {label} à envoyer
                        </StyledFormHelperText>
                      </Fragment>
                    )}
                    <CustomColorButton component="span" size="small">
                      Parcourir
                    </CustomColorButton>
                  </StyledFormLabel>
                )}
              </Container>
            )}
          </FormControl>
        </StyledListItem>
        <SideFormLabel>
          {fileExistsOnServer ? (
            isTransmitted ? (
              <SideButton disabled>
                <Check />
                Transmis à Pôle Emploi
              </SideButton>
            ) : (
              <Fragment>
                {hiddenInput}
                <SideButton component="span" size="small">
                  <Autorenew style={{ transform: 'rotate(-90deg)' }} />
                  Remplacer le document
                </SideButton>
              </Fragment>
            )
          ) : (
            allowSkipFile && (
              <Tooltip
                placement="top"
                title={
                  <Typography style={{ color: '#fff' }}>
                    Cochez cette case si vous avez transmis ce document à Pôle
                    Emploi par d'autres moyens que Zen.
                  </Typography>
                }
              >
                <SideButton onClick={skipFile}>
                  <CheckBoxOutlineBlank />
                  Transmis à Pôle Emploi {/* eslint-disable-line */}
                </SideButton>
              </Tooltip>
            )
          )}
        </SideFormLabel>
      </StyledContainer>
    )
  }
}

export default AdditionalDocumentUpload
