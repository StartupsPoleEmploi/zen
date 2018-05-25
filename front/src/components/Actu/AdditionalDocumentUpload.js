import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormLabel from '@material-ui/core/FormLabel'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

// refactor styles with AdditionalDocumentUpload

const StyledListItem = styled(ListItem)`
  && {
    padding-top: 1.5rem;
  }
`

const StyledFormLabel = styled(FormLabel)`
  && {
    display: flex;
    background-color: #f5f5f5;
    border-radius: 0.5rem;
    padding: 0 0.5rem;
    align-items: center;
  }
`

const StyledFormHelperText = styled(FormHelperText)`
  && {
    margin-top: 0;
  }
`

const SentDocumentContainer = styled.div`
  display: flex;
  align-items: center;
`

const ErrorTypography = styled(Typography)`
  && {
    color: red;
  }
`

const StyledTypography = styled(Typography)`
  && {
    padding-right: 0.5rem;
  }
`

const StyledA = styled.a`
  color: #7b7b7b;
`

export class AdditionalDocumentUpload extends Component {
  static propTypes = {
    declarationId: PropTypes.number.isRequired,
    error: PropTypes.string,
    file: PropTypes.string,
    name: PropTypes.string,
    isLoading: PropTypes.bool,
    submitFile: PropTypes.func.isRequired,
  }

  submitFile = ({ target: { files } }) =>
    this.props.submitFile({ file: files[0] })

  render() {
    const { declarationId, error, file, isLoading, name, label } = this.props

    return (
      <StyledListItem divider>
        <ListItemText primary={<b>{label}</b>} />
        <ListItemSecondaryAction>
          <FormControl>
            {error ? (
              <ErrorTypography>{error}</ErrorTypography>
            ) : isLoading ? (
              <CircularProgress />
            ) : file ? (
              <SentDocumentContainer>
                <StyledA
                  href={`/api/declarations/files?declarationId=${declarationId}&name=${name}`}
                  target="_blank"
                >
                  <StyledTypography variant="caption">
                    Voir l'attestation
                  </StyledTypography>
                </StyledA>
                <StyledFormLabel>
                  <input
                    style={{ display: 'none' }}
                    type="file"
                    onChange={this.submitFile}
                  />
                  <Button component="span" size="small">
                    Remplacer
                  </Button>
                </StyledFormLabel>
              </SentDocumentContainer>
            ) : (
              <StyledFormLabel>
                <input
                  style={{ display: 'none' }}
                  type="file"
                  onChange={this.submitFile}
                />
                <StyledFormHelperText>{label} à envoyer</StyledFormHelperText>
                <Button component="span" size="small">
                  Parcourir
                </Button>
              </StyledFormLabel>
            )}
          </FormControl>
        </ListItemSecondaryAction>
      </StyledListItem>
    )
  }
}

export default AdditionalDocumentUpload
