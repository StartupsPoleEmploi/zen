import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormLabel from '@material-ui/core/FormLabel'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'
import { capitalize } from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

// refactor styles with SickLeaveUpload

const StyledListItem = styled(ListItem)`
  && {
    padding-top: 2rem;
    flex-wrap: wrap;
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

const StyledFormHelperText = styled(FormHelperText)`
  && {
    margin-top: 0;
  }
`

const Container = styled.div`
  display: flex;
  align-items: center;
`

const ErrorTypography = styled(Typography).attrs({ variant: 'caption' })`
  && {
    color: red;
    padding-right: 1rem;
  }
`

const StyledTypography = styled(Typography)`
  && {
    padding-right: 1rem;
  }
`

const StyledA = styled.a`
  color: #7b7b7b;
`

export class EmployerDocumentUpload extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    employerName: PropTypes.string.isRequired,
    error: PropTypes.string,
    file: PropTypes.string,
    isLoading: PropTypes.bool,
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
      ? 'attestation employeur'
      : 'bulletin de salaire'

    const formattedError = <ErrorTypography>{error}</ErrorTypography>

    const input = (
      <input
        accept=".png, .jpg, .jpeg, .pdf"
        style={{ display: 'none' }}
        type="file"
        onChange={this.submitFile}
      />
    )

    return (
      <StyledListItem divider>
        <ListItemText
          primary={
            <b>
              {capitalize(documentToGive)} : {employerName}
            </b>
          }
        />
        <FormControl>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <Container>
              {error
                ? formattedError
                : file && (
                    <StyledA
                      href={`/api/employers/files?employerId=${id}`}
                      target="_blank"
                    >
                      <StyledTypography variant="caption">
                        Voir {documentToGive}
                      </StyledTypography>
                    </StyledA>
                  )}
              <StyledFormLabel>
                {input}
                {!file &&
                  !error && (
                    <StyledFormHelperText>
                      {capitalize(documentToGive)} à envoyer
                    </StyledFormHelperText>
                  )}
                <Button component="span" size="small">
                  {file ? 'Remplacer' : 'Parcourir'}
                </Button>
              </StyledFormLabel>
            </Container>
          )}
        </FormControl>
      </StyledListItem>
    )
  }
}

export default EmployerDocumentUpload
