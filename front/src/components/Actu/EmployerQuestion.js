import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from '@material-ui/core'
import React, { Component } from 'react'

import PropTypes from 'prop-types'
import styled from 'styled-components'

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #000;
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 1rem;
`

const StyledTextField = styled(TextField)`
  && {
    margin-right: 1rem;
  }
`

const StyledFormControl = styled(FormControl)`
  && {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex: 0 1 auto;
    border-left: 1px solid #000;
    padding-left: 1rem;
  }
`

const StyledFormLabel = styled(FormLabel)`
  flex-shrink: 1;
  margin-right: 1rem;
`

export class EmployerQuestion extends Component {
  static propTypes = {
    employerName: PropTypes.string,
    workHours: PropTypes.string,
    salary: PropTypes.string,
    hasEndedThisMonth: PropTypes.bool,
    index: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  onChange = ({ target: { name, value } }) =>
    this.props.onChange({
      ...this.props,
      [name]: name !== 'hasEndedThisMonth' ? value : value === 'yes',
    })

  render() {
    const { employerName, workHours, salary, hasEndedThisMonth } = this.props

    const hasEndedThisMonthValue =
      hasEndedThisMonth === null ? '' : hasEndedThisMonth ? 'yes' : 'no'

    return (
      <StyledContainer>
        <div>
          <StyledTextField
            label="Nom de l'employeur"
            name="employerName"
            value={employerName}
            onChange={this.onChange}
          />
          <StyledTextField
            label="Nombre d'heures"
            name="workHours"
            value={workHours}
            onChange={this.onChange}
          />
          <StyledTextField
            label="Salaire brut €"
            name="salary"
            value={salary}
            onChange={this.onChange}
          />
        </div>
        <StyledFormControl required>
          <StyledFormLabel>Ce contrat se termine-t-il en mai ?</StyledFormLabel>
          <RadioGroup
            row
            aria-label="oui ou non"
            name="hasEndedThisMonth"
            value={hasEndedThisMonthValue}
            onChange={this.onChange}
          >
            <FormControlLabel
              value="yes"
              control={<Radio color="primary" />}
              label="Oui"
            />
            <FormControlLabel
              value="no"
              control={<Radio color="primary" />}
              label="Non"
            />
          </RadioGroup>
        </StyledFormControl>
      </StyledContainer>
    )
  }
}

export default EmployerQuestion
