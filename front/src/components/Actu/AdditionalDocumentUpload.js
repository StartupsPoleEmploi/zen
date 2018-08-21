import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormLabel from '@material-ui/core/FormLabel'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'
import Autorenew from '@material-ui/icons/Autorenew'
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

const ReplaceDocFormLabel = StyledFormLabel.extend`
  && {
    width: 12rem;
    background-color: #fff;
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

const ReplaceButton = styled(Button)`
  & > * {
    flex-direction: column;
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
    submitFile: PropTypes.func.isRequired,
  }

  submitFile = ({ target: { files } }) =>
    this.props.submitFile({ file: files[0] })

  render() {
    const {
      declarationId,
      error,
      fileExistsOnServer,
      isLoading,
      name,
      label,
    } = this.props

    const formattedError = <ErrorTypography>{error}</ErrorTypography>

    const hiddenInput = (
      <input
        accept=".png, .jpg, .jpeg, .pdf"
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
                      <a
                        href={`/api/declarations/files?declarationId=${declarationId}&name=${name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outlined">
                          <EyeIcon />
                          Voir l'attestation
                        </Button>
                      </a>
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
        <ReplaceDocFormLabel>
          {fileExistsOnServer && (
            <Fragment>
              {hiddenInput}
              <ReplaceButton size="small">
                <Autorenew />
                Remplacer le document
              </ReplaceButton>
            </Fragment>
          )}
        </ReplaceDocFormLabel>
      </StyledContainer>
    )
  }
}

export default AdditionalDocumentUpload
