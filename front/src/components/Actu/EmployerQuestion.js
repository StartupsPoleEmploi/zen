import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormLabel from '@material-ui/core/FormLabel'
import TextField from '@material-ui/core/TextField'
import Delete from '@material-ui/icons/DeleteOutlined'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import styled from 'styled-components'
import withWidth from '@material-ui/core/withWidth'

import EuroInput from '../Generic/EuroInput'
import HourInput from '../Generic/HourInput'
import YesNoRadioGroup from '../Generic/YesNoRadioGroup'
import TooltipOnFocus from '../Generic/TooltipOnFocus'
import warn from '../../images/warn.png'

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

const StyledFormControl = styled(FormControl)`
  && {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex: 0 1 auto;
    max-width: 30rem;

    @media (max-width: 811px) {
      margin-top: 1rem;
    }
  }
`

const StyledFormLabel = styled(FormLabel)`
  flex-shrink: 1;
  margin-right: 1rem;
  && {
    color: #000;
  }
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

const EmployerQuestionContainer = styled.div`
  display: inline-flex;
  @media (max-width: 811px) {
    width: 100%;
  }
`

const DeleteIcon = styled(Delete)`
  && {
    width: 2.5rem;
    height: 2.5rem;
  }
`

const StyledTextField = styled(TextField)`
  && {
    width: 15rem;
    margin-right: 1rem;

    @media (max-width: 811px) {
      margin-right: inherit;
      width: 100%;
    }
  }
`

const InfoImg = styled.img`
  width: 2rem;
  position: absolute;
  margin-left: 3px;
  cursor: pointer;
  z-index: 2;
`

export class EmployerQuestion extends PureComponent {
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

  renderLabel = ({ id, label, content, showTooltip }) => (
    <div>
      {label}
      {showTooltip && (
        <TooltipOnFocus tooltipId={id} content={content}>
          <InfoImg src={warn} alt="Informations" />
        </TooltipOnFocus>
      )}
    </div>
  )

  render() {
    const {
      employerName,
      index,
      workHours,
      salary,
      hasEndedThisMonth,
      verticalLayout,
      width,
    } = this.props

    const showTooltip = index === 0

    return (
      <StyledContainer className="employer-question">
        <StyledMain>
          <div>
            <EmployerQuestionContainer>
              <StyledTextField
                id={`employerName[${index}]`}
                className="root-employer"
                label={this.renderLabel({
                  id: `employerName[${index}]`,
                  label: 'Nom employeur',
                  content:
                    'Si vous avez plusieurs employeurs, cliquez sur "Ajouter un employeur"',
                  showTooltip,
                })}
                name={`employerName[${index}]`}
                value={employerName.value}
                onChange={this.onChange}
                onBlur={this.onChange}
                error={!!employerName.error}
                helperText={employerName.error}
                inputProps={{
                  'aria-describedby': `employerNameDescription[${index}]`,
                }}
                fullWidth={verticalLayout}
              />
            </EmployerQuestionContainer>

            <EmployerQuestionContainer>
              <StyledTextField
                id={`workHours[${index}]`}
                className="root-work-hours"
                label={this.renderLabel({
                  id: `workHours[${index}]`,
                  label: "Nombre d'heures",
                  content:
                    'Indiquez les heures qui seront inscrites sur votre fiche de paie',
                  showTooltip,
                })}
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
                fullWidth={verticalLayout}
              />
            </EmployerQuestionContainer>

            <EmployerQuestionContainer>
              <StyledTextField
                id={`salary[${index}]`}
                className="root-salary"
                label={this.renderLabel({
                  id: `salary[${index}]`,
                  label: 'Salaire brut €',
                  content: 'Déclarez le salaire brut pour cet employeur',
                  showTooltip,
                })}
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
                fullWidth={verticalLayout}
              />
            </EmployerQuestionContainer>
          </div>
          <StyledFormControl className="root-contract">
            <StyledFormLabel
              style={{ paddingTop: '1rem', paddingBottom: '1rem' }}
            >
              {width !== 'xs' ? (
                <>
                  Contrat terminé en{' '}
                  {moment(this.props.activeMonth).format('MMMM')}
                  &nbsp;?
                </>
              ) : (
                <>
                  Terminé en {moment(this.props.activeMonth).format('MMMM')}
                  &nbsp;?
                </>
              )}
              {hasEndedThisMonth.error && (
                <FormHelperText error>{hasEndedThisMonth.error}</FormHelperText>
              )}
            </StyledFormLabel>
            <YesNoRadioGroup
              yesTooltipContent={`Si votre employeur vous a payé des congés, n’oubliez pas
                    d’inclure cette somme dans le salaire brut déclaré`}
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
          <DeleteIcon />
        </RemoveButton>
      </StyledContainer>
    )
  }
}

EmployerQuestion.propTypes = {
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
  verticalLayout: PropTypes.bool,
  width: PropTypes.string.isRequired,
}

export default withWidth()(EmployerQuestion)
