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
    padding-top: 2.2rem;
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
    padding-right: 1rem;
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

export class AdditionalDocumentUpload extends Component {
  static propTypes = {
    declarationId: PropTypes.number.isRequired,
    error: PropTypes.string,
    file: PropTypes.string,
    label: PropTypes.string.isRequired,
    name: PropTypes.string,
    isLoading: PropTypes.bool,
    submitFile: PropTypes.func.isRequired,
  }

  submitFile = ({ target: { files } }) =>
    this.props.submitFile({ file: files[0] })

  render() {
    const { declarationId, error, file, isLoading, name, label } = this.props

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
        <ListItemText primary={<b>{label}</b>} />
        <ListItemSecondaryAction>
          <FormControl>
            {isLoading ? (
              <CircularProgress />
            ) : (
              <Container>
                {error
                  ? formattedError
                  : file && (
                      <StyledA
                        href={`/api/declarations/files?declarationId=${declarationId}&name=${name}`}
                        target="_blank"
                      >
                        <StyledTypography variant="caption">
                          Voir l'attestation
                        </StyledTypography>
                      </StyledA>
                    )}
                <StyledFormLabel>
                  {input}
                  {!file &&
                    !error && (
                      <StyledFormHelperText>
                        {label} à envoyer
                      </StyledFormHelperText>
                    )}
                  <Button component="span" size="small">
                    {file ? 'Remplacer' : 'Parcourir'}
                  </Button>
                </StyledFormLabel>
              </Container>
            )}
          </FormControl>
        </ListItemSecondaryAction>
      </StyledListItem>
    )
  }
}

export default AdditionalDocumentUpload
