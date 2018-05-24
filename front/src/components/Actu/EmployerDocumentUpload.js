import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormLabel from '@material-ui/core/FormLabel'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'
import { capitalize } from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

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

export class EmployerDocumentUpload extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    employerName: PropTypes.string.isRequired,
    file: PropTypes.string,
    hasEndedThisMonth: PropTypes.bool.isRequired,
    submitFile: PropTypes.func.isRequired,
  }

  submitFile = ({ target: { files } }) =>
    this.props.submitFile({ file: files[0], employerId: this.props.id })

  render() {
    const {
      employerName,
      error,
      file,
      id,
      hasEndedThisMonth,
      isLoading,
    } = this.props

    const documentToGive = hasEndedThisMonth
      ? 'justificatif de travail'
      : 'bulletin de salaire'

    return (
      <StyledListItem divider>
        <ListItemText primary={<b>Bulletin de salaire : {employerName}</b>} />
        <ListItemSecondaryAction>
          <FormControl>
            {error ? (
              <ErrorTypography>{error}</ErrorTypography>
            ) : isLoading ? (
              <CircularProgress />
            ) : file ? (
              <SentDocumentContainer>
                <StyledA
                  href={`/api/employers/files?employerId=${id}`}
                  target="_blank"
                >
                  <StyledTypography variant="caption">
                    Voir le {documentToGive}
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
                <StyledFormHelperText>
                  {capitalize(documentToGive)} à envoyer
                </StyledFormHelperText>
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

export default EmployerDocumentUpload
