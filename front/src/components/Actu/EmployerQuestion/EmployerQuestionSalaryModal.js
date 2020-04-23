import PropTypes from 'prop-types'
import moment from 'moment'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import React, { useState } from 'react'
import styled from 'styled-components'

import EuroInput from '../../Generic/EuroInput'
import CustomDialog from '../../Generic/CustomDialog'
import MainActionButton from '../../Generic/MainActionButton'
import { errorOrange } from '../../../constants'
import TooltipOnFocus from '../../Generic/TooltipOnFocus'
import warn from '../../../images/warn.png'


const ExclamationMark = styled.div`
  color: ${errorOrange};
  font-weight: bolder;
  font-size: 2.5rem;
  position: relative;
  top: -3px;
  margin-right: 1rem;
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

export default function EmployerQuestionSalaryModal(props) {
  const { index, onChange, onClose, isOpened, activeMonth } = props;
  const [salary, setSalary] = useState({ value: null, error: null });
  const [partial, setPartial] = useState({ value: null, error: null });

  const onChangeModalSalary = ({ target: { value } }) => {
    setSalary({ value, error: null })
  }
  const onChangeModalPartial = ({ target: { value } }) => {
    setPartial({ value, error: null })
  }

  const onSubmit = () => {
    onChange(Number(salary.value || 0) + Number(partial.value || 0))
    onClose()
  }

  // eslint-disable-next-line react/prop-types
  const renderLabel = ({ id, label, content, showTooltip }) => (
    <div>
      {label}
      {showTooltip && (
        <TooltipOnFocus tooltipId={id} content={content}>
          <InfoImg src={warn} alt="Informations" />
        </TooltipOnFocus>
      )}
    </div>
  )

  return <CustomDialog
    fullWidth
    content={
      <div style={{ textAlign: 'left' }} >
        <Typography>
          <b>Au mois de {moment(activeMonth).format('MMMM')},</b> pour cet employeur
        </Typography>
        <ul>
          <li style={{ marginBottom: '3rem' }}>
            <Typography>
              Vous avez travaillé <b>OU</b> avez eu un maintien de la mensualisation, déclarez:
            </Typography>
            <StyledTextField
              id={`modal-salary[${index}]`}
              className="root-modal-salary"
              label={renderLabel({
                id: `modal-salary[${index}]`,
                label: 'Salaire € Brut',
                showTooltip: false,
              })}
              name={`modal-salary[${index}]`}
              value={salary.value}
              onChange={onChangeModalSalary}
              InputProps={{
                inputComponent: EuroInput,
              }}
              // eslint-disable-next-line react/jsx-no-duplicate-props
              inputProps={{
                maxLength: 10,
                autocomplete: "off",
                'aria-describedby': `salaryDescription[${index}]`,
              }}
              style={{width: '50%'}}
            />
          </li>
          <li style={{ marginBottom: '5rem' }}>
            <Typography style={{textAlign: 'left'}}>
              En activité partielle, déclarez
            </Typography>
            <StyledTextField
              id={`modal-partial[${index}]`}
              className="root-modal-partial"
              label={renderLabel({
                id: `modal-partial[${index}]`,
                label: 'Montant € Net',
                content: <>
                  Il s'agit du montant <b>net</b> de votre activité partielle payé par votre employeur. 
                  Vous devez déclarer 1h ou ajouter 1h au nombre d'heures travaillées.
                </>,
                showTooltip: true,
              })}
              name={`modal-partial[${index}]`}
              value={partial.value}
              onChange={onChangeModalPartial}
              error={!!partial.error}
              helperText={partial.error}
              InputProps={{
                inputComponent: EuroInput,
              }}
              // eslint-disable-next-line react/jsx-no-duplicate-props
              inputProps={{
                maxLength: 10,
                autocomplete: "off",
                'aria-describedby': `partialDescription[${index}]`,
              }}
              style={{width: '50%'}}
            />
          </li>
        </ul>
        <div style={{display: "flex"}}>
          <ExclamationMark aria-hidden="true">!</ExclamationMark>
          <Typography style={{textAlign: 'left'}}>
            Si vous déclarez un salaire brut et une indemnité d'activité partielle, les deux montants seront addictionnés dans la case Total €.
            Si vous avez reçu un don, pas besoin de le déclarer.
          </Typography>
        </div>
      </div>
    }
    title={
      <>
        RÉMUNÉRATION €
        <br/>
        CRISE <span style={{ color: errorOrange }} >COVID-19</span>
      </>
    }
    actions={
      <>
        <MainActionButton primary={false} onClick={onClose}>
          Annuler
        </MainActionButton>
        <MainActionButton
          variant="contained"
          onClick={onSubmit}
          color="primary"
        >
          Oui, je confirme
        </MainActionButton>
      </>
    }
    titleId={`EmployerQuestionDialogTitle${index}`}
    isOpened={isOpened}
    onCancel={onClose}
  />

}

EmployerQuestionSalaryModal.propTypes = {
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isOpened: PropTypes.bool.isRequired,
  activeMonth: PropTypes.instanceOf(Date).isRequired,
}




