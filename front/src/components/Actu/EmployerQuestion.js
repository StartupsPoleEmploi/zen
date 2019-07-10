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
import HourInput from '../Generic/HourInput'
import TooltipOnFocus from '../Generic/TooltipOnFocus'
import YesNoRadioGroup from '../Generic/YesNoRadioGroup'

import info from '../../images/info.svg'

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
    align-items: center;
    justify-content: center;
    flex: 0 1 auto;
  }
`

const StyledFormLabel = styled(FormLabel)`
  flex-shrink: 1;
  margin-right: 2rem;
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
    line-height: 2rem;
  }
`

const TooltipTitle = styled(Typography)`
  && {
    font-weight: bold;
    font-size: 1.6rem;
    padding-bottom: 1.5rem;
  }
`

const InfoImg = styled.img`
  width: 2.5rem;
  float: left;
  margin-right: 1rem;
`

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
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    activeMonth: PropTypes.instanceOf(Date).isRequired,
  }

  renderTextField(textField, tooltip) {
    if (!tooltip) return textField

    return (
      <TooltipOnFocus tooltipId={tooltip.id} content={tooltip.content}>
        {textField}
      </TooltipOnFocus>
    )
  }

  onChange = ({ target: { name: fieldName, value: _value }, type }) => {
    let value = _value
    if (type === 'blur' && fieldName.startsWith('employerName')) {
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

    const showTooltip = index === 0

    // Employer
    const employerTextField = (
      <StyledTextField
        id={`employerName[${index}]`}
        label="Nom employeur"
        name={`employerName[${index}]`}
        value={employerName.value}
        onChange={this.onChange}
        onBlur={this.onChange}
        error={!!employerName.error}
        helperText={employerName.error}
        inputProps={{
          'aria-describedby': `employerNameDescription[${index}]`,
        }}
      />
    )
    const employerTooltip = (
      <Fragment>
        <TooltipTitle>
          <InfoImg src={info} alt="" />
          Information
        </TooltipTitle>
        <TooltipText>
          Si vous avez plusieurs employeurs, ajoutez une ligne par employeur.
        </TooltipText>
      </Fragment>
    )

    // Work hours
    const workHoursTextField = (
      <StyledTextField
        id={`workHours[${index}]`}
        label="Nombre d'heures"
        name={`workHours[${index}]`}
        value={workHours.value}
        onChange={this.onChange}
        error={!!workHours.error}
        helperText={workHours.error}
        InputProps={{
          inputComponent: HourInput,
        }}
        // eslint-disable-next-line react/jsx-no-duplicate-props
        inputProps={{
          maxLength: 4,
          'aria-describedby': `workHoursDescription[${index}]`,
        }}
      />
    )
    const workHoursTooltip = (
      <Fragment>
        <TooltipTitle>
          <InfoImg src={info} alt="" />
          Information
        </TooltipTitle>
        <TooltipText>Déclarez les heures réellement travaillées</TooltipText>
      </Fragment>
    )

    // Salary
    const salaryTextField = (
      <StyledTextField
        id={`salary[${index}]`}
        label="Salaire brut €"
        name={`salary[${index}]`}
        value={salary.value}
        onChange={this.onChange}
        error={!!salary.error}
        helperText={salary.error}
        InputProps={{
          inputComponent: EuroInput,
        }}
        // eslint-disable-next-line react/jsx-no-duplicate-props
        inputProps={{
          maxLength: 10,
          'aria-describedby': `salaryDescription[${index}]`,
        }}
      />
    )

    const salaryTooltip = (
      <Fragment>
        <TooltipTitle>
          <InfoImg src={info} alt="" />
          Information
        </TooltipTitle>
        <TooltipText>Déclarez le salaire brut pour cet employeur</TooltipText>
      </Fragment>
    )

    return (
      <StyledContainer>
        <StyledMain>
          <FieldsContainer>
            {this.renderTextField(
              employerTextField,
              showTooltip
                ? {
                    id: `employerNameDescription[${index}]`,
                    content: employerTooltip,
                  }
                : null,
            )}

            {this.renderTextField(
              workHoursTextField,
              showTooltip
                ? {
                    id: `workHoursDescription[${index}]`,
                    content: workHoursTooltip,
                  }
                : null,
            )}

            {this.renderTextField(
              salaryTextField,
              showTooltip
                ? {
                    id: `salaryDescription[${index}]`,
                    content: salaryTooltip,
                  }
                : null,
            )}
          </FieldsContainer>
          <StyledFormControl>
            <StyledFormLabel
              style={{ paddingTop: '1rem', paddingBottom: '1rem' }}
            >
              Ce contrat se
              <br />
              termine-t-il en {moment(this.props.activeMonth).format('MMMM')} ?
              {hasEndedThisMonth.error && (
                <FormHelperText error>{hasEndedThisMonth.error}</FormHelperText>
              )}
            </StyledFormLabel>
            <YesNoRadioGroup
              yesTooltipContent={
                showTooltip ? (
                  <Fragment>
                    <TooltipTitle>
                      <InfoImg src={info} alt="" />
                      Information
                    </TooltipTitle>
                    <TooltipText>
                      Si votre employeur vous a payé des congés, n’oubliez pas
                      d’inclure cette somme dans le salaire brut déclaré
                    </TooltipText>
                  </Fragment>
                ) : null
              }
              name={`hasEndedThisMonth[${index}]`}
              value={hasEndedThisMonth.value}
              onAnswer={this.onChange}
            />
          </StyledFormControl>
        </StyledMain>
        <RemoveButton
          onClick={this.onRemove}
          type="button"
          aria-label="Supprimer"
        >
          <CancelIcon />
        </RemoveButton>
      </StyledContainer>
    )
  }
}

export default EmployerQuestion
