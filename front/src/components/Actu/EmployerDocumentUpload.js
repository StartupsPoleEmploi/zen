import Button from '@material-ui/core/Button'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormLabel from '@material-ui/core/FormLabel'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'
import superagent from 'superagent'

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

export class EmployerDocumentUpload extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    employerName: PropTypes.string.isRequired,
  }

  submitFile = ({ target: { files } }) => {
    superagent
      .post('/api/employers/files')
      .field('employerId', this.props.id)
      .attach('employerFile', files[0])
      .then(() => alert('cool'))
  }

  render() {
    const { employerName } = this.props
    return (
      <StyledListItem divider>
        <ListItemText primary={<b>Bulletin de salaire : {employerName}</b>} />
        <ListItemSecondaryAction>
          <FormControl>
            <StyledFormLabel>
              <input
                style={{ display: 'none' }}
                type="file"
                onChange={this.submitFile}
              />
              <StyledFormHelperText>
                Bulletin de salaire à envoyer
              </StyledFormHelperText>
              <Button component="span" size="small">
                Parcourir
              </Button>
            </StyledFormLabel>
          </FormControl>
        </ListItemSecondaryAction>
      </StyledListItem>
    )
  }
}

export default EmployerDocumentUpload
