import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormLabel from '@material-ui/core/FormLabel'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Cancel from '@material-ui/icons/Cancel'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import styled from 'styled-components'

import EuroInput from '../Generic/EuroInput'
import Rectangle from '../Generic/Rectangle'
import TooltipOnFocus from '../Generic/TooltipOnFocus'
import YesNoRadioGroup from '../Generic/YesNoRadioGroup'

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
`

const StyledMain = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  border: 1px solid #adafaf;
  border-radius: 1rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  margin-top: 1rem;
  max-width: 95rem;
  flex-wrap: wrap;
  box-shadow: 0 0 0.5rem 0.1rem #eeeeee;
`

const FieldsContainer = styled.div`
  flex: 1 1 20rem;
  border-right: 1px solid #000;
`

const StyledTextField = styled(TextField)`
  && {
    margin-right: 1.5rem;
    width: 15rem;
  }
`

const StyledFormControl = styled(FormControl)`
  && {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    flex: 0 1 auto;
    padding-left: 1.5rem;
  }
`

const StyledFormLabel = styled(FormLabel)`
  flex-shrink: 1;
  margin-right: 3rem;
  && {
    color: #000;
  }
  max-width: 20rem;
`

const RemoveButton = styled.button`
  border: none;
  margin: 0;
  padding: 0;
  cursor: pointer;
  background: none;
  text-transform: uppercase;
  padding-left: 1rem;
  &::-moz-focus-inner {
    border: 0;
    padding: 0;
  }
`

const CancelIcon = styled(Cancel)`
  && {
    width: 2.5rem;
    height: 2.5rem;
  }
`

const TooltipText = styled(Typography)`
  && {
    color: #fff;
    font-size: 1.2rem;
    line-height: 1.4rem;
  }
`

const TooltipTitle = styled(Typography)`
  && {
    color: #fff;
    font-weight: bold;
    padding-bottom: 0.5rem;
  }
`

const RectangleStyle = {
  width: '1.4rem',
  height: '0.3rem',
  borderRadius: '0.2rem',
  marginTop: '1rem',
  marginBottom: '1rem',
}

export class EmployerQuestion extends Component {
  static propTypes = {
    employerName: PropTypes.shape({
      value: PropTypes.string,
      error: PropTypes.string,
    }).isRequired,
    workHours: PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      error: PropTypes.string,
    }).isRequired,
    salary: PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      error: PropTypes.string,
    }).isRequired,
    hasEndedThisMonth: PropTypes.shape({
      value: PropTypes.bool,
      error: PropTypes.string,
    }),
    index: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired, // eslint-disable-line
    onRemove: PropTypes.func.isRequired,
    activeMonth: PropTypes.instanceOf(Date).isRequired,
  }

  onChange = ({ target: { name: fieldName, value: _value }, type }) => {
    let value = _value
    if (
      (type === 'blur' && fieldName.startsWith('employerName')) ||
      fieldName.startsWith('workHours')
    ) {
      value = (_value || '').trim()
    }
    // The input 'name' attribute needs an array format
    // to avoid confusions (for example, browser autocompletions)
    // but the parent component here juste needs 'employerName'
    // for example.
    const name = fieldName.substr(0, fieldName.indexOf('['))
    this.props.onChange({
      name,
      value,
      index: this.props.index,
    })
  }

  onRemove = () => this.props.onRemove(this.props.index)

  render() {
    const {
      employerName,
      index,
      workHours,
      salary,
      hasEndedThisMonth,
    } = this.props

    return (
      <StyledContainer>
        <StyledMain>
          <FieldsContainer>
            <TooltipOnFocus
              content={
                <Fragment>
                  <Rectangle style={RectangleStyle} />
                  <TooltipTitle>Information</TooltipTitle>
                  <TooltipText>
                    Si vous avez plusieurs bulletins de salaire par famille car
                    vous gardez plusieurs enfants, ajoutez une ligne par
                    bulletin de salaire.
                  </TooltipText>
                </Fragment>
              }
            >
              <StyledTextField
                label="Nom employeur"
                name={`employerName[${index}]`}
                value={employerName.value}
                onChange={this.onChange}
                onBlur={this.onChange}
                error={!!employerName.error}
                helperText={employerName.error}
              />
            </TooltipOnFocus>
            <TooltipOnFocus
              content={
                <Fragment>
                  <Rectangle style={RectangleStyle} />
                  <TooltipTitle>Information</TooltipTitle>
                  <TooltipText>
                    Indiquez le nombre d'heures qui figurera sur votre fiche de
                    paie (ex: heures mensualisées + complémentaires)
                  </TooltipText>
                </Fragment>
              }
            >
              <StyledTextField
                label="Nombre d'heures"
                name={`workHours[${index}]`}
                value={workHours.value}
                onChange={this.onChange}
                error={!!workHours.error}
                helperText={workHours.error}
                inputProps={{
                  maxLength: 3,
                }}
              />
            </TooltipOnFocus>
            <TooltipOnFocus
              content={
                <Fragment>
                  <Rectangle style={RectangleStyle} />
                  <TooltipTitle>Information</TooltipTitle>
                  <TooltipText>
                    Si votre employeur vous a payé des congés, n’oubliez pas
                    d’inclure cette somme dans le salaire déclaré
                  </TooltipText>
                </Fragment>
              }
            >
              <StyledTextField
                label="Salaire brut €"
                name={`salary[${index}]`}
                value={salary.value}
                onChange={this.onChange}
                error={!!salary.error}
                helperText={salary.error}
                InputProps={{
                  inputComponent: EuroInput,
                }}
                // eslint-disable-next-line
                inputProps={{
                  maxLength: 10,
                }}
              />
            </TooltipOnFocus>
          </FieldsContainer>
          <StyledFormControl>
            <StyledFormLabel>
              Ce contrat se<br />termine-t-il en{' '}
              {moment(this.props.activeMonth).format('MMMM')} ?
              {hasEndedThisMonth.error && (
                <FormHelperText error>{hasEndedThisMonth.error}</FormHelperText>
              )}
            </StyledFormLabel>
            <YesNoRadioGroup
              name={`hasEndedThisMonth[${index}]`}
              value={hasEndedThisMonth.value}
              onAnswer={this.onChange}
            />
          </StyledFormControl>
        </StyledMain>
        <RemoveButton onClick={this.onRemove} type="button">
          <CancelIcon />
          <Typography variant="caption" style={{ color: 'black' }}>
            Supprimer
          </Typography>
        </RemoveButton>
      </StyledContainer>
    )
  }
}

export default EmployerQuestion
