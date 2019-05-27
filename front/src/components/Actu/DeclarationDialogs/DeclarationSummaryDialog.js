import React, { Fragment } from 'react'
import NumberFormat from 'react-number-format'
import PropTypes from 'prop-types'
import { isNaN as _isNaN } from 'lodash'
import styled from 'styled-components'

import { Typography } from '@material-ui/core'
import DialogContentText from '@material-ui/core/DialogContentText'

import MainActionButton from '../../Generic/MainActionButton'
import CustomDialog from '../../Generic/CustomDialog'

import {
  formattedDeclarationMonth,
  formatIntervalDates,
  formatDate,
} from '../../../lib/date'
import { types, JOB_SEARCH_END_MOTIVE } from '../../../pages/actu/Actu'
import {
  MIN_SALARY,
  SALARY,
  MAX_SALARY,
  calculateTotal,
} from '../../../lib/salary'

const StyledDialogContentText = styled(DialogContentText)`
  && {
    border-bottom: solid 2px #f2f2f2;
    padding: 0 5rem 2rem 5rem;
    color: black;
  }
`

const DeclarationContent = styled(DialogContentText).attrs({
  component: 'div',
})`
  && {
    margin: auto;
    max-width: 29rem;
    text-align: left;
    padding-bottom: 3rem;
  }
`

const DeclarationHeader = styled.div`
  font-weight: bold;
  color: black;
  margin-top: 2rem;
  text-transform: uppercase;
`

const DeclarationValues = styled(Typography).attrs({ color: 'secondary' })`
  && {
    font-weight: bold;
    font-size: 1.6rem;
  }
`

const DeclarationUl = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
  font-weight: bold;
`

const DeclarationLi = styled(DeclarationValues).attrs({
  component: 'li',
})``

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 40rem;
  padding-top: 0.5rem;
`

const DeclarationSummaryDialog = ({
  declaration,
  employers = [],
  onCancel,
  onConfirm,
  ...props
}) => {
  const sickLeaves = declaration.infos.filter(
    (info) => info.type === types.SICK_LEAVE,
  )
  const maternityLeave = declaration.infos.find(
    (info) => info.type === types.MATERNITY_LEAVE,
  )
  const interships = declaration.infos.filter(
    (info) => info.type === types.INTERNSHIP,
  )

  const jobSearch = declaration.infos.find(
    (info) => info.type === types.JOB_SEARCH,
  )

  const invalidity = declaration.infos.find(
    (info) => info.type === types.INVALIDITY,
  )
  const retirement = declaration.infos.find(
    (info) => info.type === types.RETIREMENT,
  )

  const totalSalary = employers.length
    ? calculateTotal(employers, SALARY, MIN_SALARY, MAX_SALARY)
    : 0

  return (
    <CustomDialog
      content={
        <Fragment>
          <StyledDialogContentText>
            Voici le récapitulatif de votre actualisation pour le mois
            {declaration.declarationMonth && (
              // FIXME this is a quickfix for the Actu page, but we should always have the month.
              <Fragment>
                {' '}
                de{' '}
                <b>
                  {formattedDeclarationMonth(
                    declaration.declarationMonth.month,
                  )}
                </b>
                , est-il exact et complet ?
              </Fragment>
            )}
          </StyledDialogContentText>

          <DeclarationContent>
            {declaration.hasWorked && employers.length && (
              <Fragment>
                <div>
                  <DeclarationHeader>
                    {employers.length}{' '}
                    {employers.length >= 2 ? 'employeurs' : 'employeur'}
                  </DeclarationHeader>
                  <DeclarationUl>
                    {employers.map((employer, i) => {
                      const key = `${i}-${employer.employerName.value}`
                      return (
                        <DeclarationLi key={key}>
                          {employer.employerName.value}
                        </DeclarationLi>
                      )
                    })}
                  </DeclarationUl>
                </div>

                <div>
                  <DeclarationHeader>
                    Salaire(s) brut déclaré(s)
                  </DeclarationHeader>
                  <DeclarationValues>
                    {_isNaN(totalSalary) || totalSalary === 0 ? (
                      '-'
                    ) : (
                      <NumberFormat
                        thousandSeparator=" "
                        decimalSeparator=","
                        decimalScale={0}
                        fixedDecimalScale
                        displayType="text"
                        suffix=" €"
                        value={totalSalary}
                      />
                    )}
                  </DeclarationValues>
                </div>
              </Fragment>
            )}

            {!declaration.hasWorked && (
              <div>
                <DeclarationHeader>Travail</DeclarationHeader>
                <DeclarationValues>
                  Vous n'avez pas travaillé.
                </DeclarationValues>
              </div>
            )}

            {declaration.hasInternship && (
              <div>
                <DeclarationHeader>
                  {interships.length}{' '}
                  {interships.length >= 2 ? 'stages' : 'stage'}
                </DeclarationHeader>
                <DeclarationUl>
                  {interships.map((intership) => (
                    <DeclarationLi key={intership.startDate}>
                      {formatIntervalDates(
                        intership.startDate,
                        intership.endDate,
                      )}
                    </DeclarationLi>
                  ))}
                </DeclarationUl>
              </div>
            )}

            {declaration.hasSickLeave && (
              <div>
                <DeclarationHeader>
                  {sickLeaves.length}{' '}
                  {sickLeaves.length >= 2 ? 'arrêts maladie' : 'arrêt maladie'}
                </DeclarationHeader>
                <DeclarationUl>
                  {sickLeaves.map((sickLeave) => (
                    <DeclarationLi key={sickLeave.startDate}>
                      {formatIntervalDates(
                        sickLeave.startDate,
                        sickLeave.endDate,
                      )}
                    </DeclarationLi>
                  ))}
                </DeclarationUl>
              </div>
            )}

            {declaration.hasMaternityLeave && (
              <div>
                <DeclarationHeader>Congé maternité</DeclarationHeader>
                <DeclarationValues>
                  Depuis le {formatDate(maternityLeave.startDate)}
                </DeclarationValues>
              </div>
            )}

            {declaration.hasInvalidity && (
              <div>
                <DeclarationHeader>Invalidité</DeclarationHeader>
                <DeclarationValues>
                  Depuis le {formatDate(invalidity.startDate)}
                </DeclarationValues>
              </div>
            )}

            {declaration.hasRetirement && (
              <div>
                <DeclarationHeader>Retraite</DeclarationHeader>
                <DeclarationValues>
                  Départ le {formatDate(retirement.startDate)}
                </DeclarationValues>
              </div>
            )}

            <div>
              <DeclarationHeader>Inscription</DeclarationHeader>
              {declaration.isLookingForJob ? (
                <DeclarationValues>
                  Oui, je souhaite rester inscrit à Pôle emploi
                </DeclarationValues>
              ) : (
                <Fragment>
                  <DeclarationValues>
                    Non, je ne souhaite pas rester inscrit à Pole Emploi
                  </DeclarationValues>

                  <DeclarationValues>
                    Date de fin : {formatDate(jobSearch.endDate)}
                  </DeclarationValues>
                  <DeclarationValues>
                    Motif :{' '}
                    {declaration.jobSearchStopMotive ===
                      JOB_SEARCH_END_MOTIVE.WORK && 'Reprise du travail'}
                    {declaration.jobSearchStopMotive ===
                      JOB_SEARCH_END_MOTIVE.RETIREMENT && 'Retraite'}
                    {declaration.jobSearchStopMotive ===
                      JOB_SEARCH_END_MOTIVE.OTHER && 'Autre'}
                  </DeclarationValues>
                </Fragment>
              )}
            </div>
          </DeclarationContent>
        </Fragment>
      }
      actions={
        <ButtonsContainer>
          <MainActionButton primary={false} onClick={onCancel}>
            Non, je modifie
          </MainActionButton>
          <MainActionButton
            variant="contained"
            onClick={onConfirm}
            primary
            autoFocus
          >
            Oui, je confirme
          </MainActionButton>
        </ButtonsContainer>
      }
      {...props}
    />
  )
}

DeclarationSummaryDialog.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  declaration: PropTypes.object.isRequired,
  employers: PropTypes.arrayOf(PropTypes.object),
}

export default DeclarationSummaryDialog
