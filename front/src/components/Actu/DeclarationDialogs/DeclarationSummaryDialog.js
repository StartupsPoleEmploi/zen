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
    padding-bottom: 3rem;
    border-bottom: solid 2px #f2f2f2;
    margin-left: -2.4rem;
    margin-right: -2.4rem;
    margin-bottom: 2.5rem;
    padding: 0 5rem 2rem 5rem;
    color: black;
  }
`

const DeclarationContent = styled(DialogContentText).attrs({
  component: 'div',
})`
  && {
    margin: auto;
    max-width: 290px;
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
const DeclarationValues = styled(Typography)`
  && {
    font-weight: bold;
    font-size: 1.6rem;
  }
`

const DeclarationList = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
  font-weight: bold;
  color: #37669f;
`

const ButtonsContainer = styled.div`
  display: flex;
  max-width: 400px;
  padding-top: 0.5rem
`

const StyledMainActionButton = styled(MainActionButton)`
  && {
    padding: 1rem;
    font-size: 1.6rem;

    &:first-child {
      margin-right: 4rem;
    }
  }
`

const DeclarationSummaryDialog = ({
  declaration,
  employers,
  onCancel,
  onConfirm,
  ...props
}) => {
  const sickLeaves = declaration.infos.filter(
    (info) => info.type === types.SICK_LEAVE,
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

  const totalSalary = calculateTotal(employers, SALARY, MIN_SALARY, MAX_SALARY)

  return (
    <CustomDialog
      content={
        <Fragment>
          <StyledDialogContentText id="ActuDialogContentText">
            Voici le récapitulatif de votre actualisation pour le mois de{' '}
            <strong>
              {formattedDeclarationMonth(declaration.declarationMonth.month)}
            </strong>
            , est-il exact et complet ?
          </StyledDialogContentText>

          <DeclarationContent>
            {employers.length && (
              <Fragment>
                <div>
                  <DeclarationHeader>
                    {employers.length}{' '}
                    {employers.length >= 2 ? 'employeurs' : 'employeur'}
                  </DeclarationHeader>
                  <DeclarationList>
                    {employers.map((employer, i) => {
                      const key = `${i}-${employer.employerName.value}`
                      return <li key={key}>{employer.employerName.value}</li>
                    })}
                  </DeclarationList>
                </div>

                <div>
                  <DeclarationHeader>
                    Salaire(s) brut déclaré(s)
                  </DeclarationHeader>
                  <DeclarationValues color="primary">
                    {_isNaN(totalSalary) || totalSalary === 0 ? (
                      '-'
                    ) : (
                        <NumberFormat
                          thousandSeparator=" "
                          decimalSeparator=","
                          decimalScale={2}
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

            {declaration.hasInternship && (
              <div>
                <DeclarationHeader>
                  {interships.length}{' '}
                  {interships.length >= 2 ? 'stages' : 'stage'}
                </DeclarationHeader>
                <DeclarationList>
                  {interships.map((intership) => (
                    <li key={intership.startDate}>
                      {formatIntervalDates(
                        intership.startDate,
                        intership.endDate,
                      )}
                    </li>
                  ))}
                </DeclarationList>
              </div>
            )}

            {declaration.hasSickLeave && (
              <div>
                <DeclarationHeader>
                  {sickLeaves.length}{' '}
                  {sickLeaves.length >= 2 ? 'arrêts maladie' : 'arrêt maladie'}
                </DeclarationHeader>
                <DeclarationList>
                  {sickLeaves.map((sickLeave) => (
                    <li key={sickLeave.startDate}>
                      {formatIntervalDates(
                        sickLeave.startDate,
                        sickLeave.endDate,
                      )}
                    </li>
                  ))}
                </DeclarationList>
              </div>
            )}

            {declaration.hasInvalidity && (
              <div>
                <DeclarationHeader>Invalidité</DeclarationHeader>
                <DeclarationValues color="primary">
                  Depuis le {formatDate(invalidity.startDate)}
                </DeclarationValues>
              </div>
            )}

            {declaration.hasRetirement && (
              <div>
                <DeclarationHeader>Retraite</DeclarationHeader>
                <DeclarationValues color="primary">
                  Départ le {formatDate(retirement.startDate)}
                </DeclarationValues>
              </div>
            )}

            <div>
              <DeclarationHeader>Souhaitez-vous rester inscrit à pole emploi </DeclarationHeader>
              {declaration.isLookingForJob ?
                <DeclarationValues color="primary">Oui, je souhaite rester inscrit à Pôle emploi</DeclarationValues> :
                <Fragment>
                  <DeclarationValues color="primary">Non, je ne souhaite pas rester inscrit à Pole Emploi</DeclarationValues>

                  <DeclarationValues color="primary">
                    Date de fin : {formatDate(jobSearch.endDate)}
                  </DeclarationValues>
                  <DeclarationValues color="primary">
                    Motif:{' '}
                    {declaration.jobSearchStopMotive ===
                      JOB_SEARCH_END_MOTIVE.WORK && 'Reprise du travail'}
                    {declaration.jobSearchStopMotive ===
                      JOB_SEARCH_END_MOTIVE.RETIREMENT && 'Retraite'}
                    {declaration.jobSearchStopMotive ===
                      JOB_SEARCH_END_MOTIVE.OTHER && 'Autre'}
                  </DeclarationValues>
                </Fragment>}
            </div>
          </DeclarationContent>
        </Fragment>
      }
      actions={
        <ButtonsContainer>
          <StyledMainActionButton primary={false} onClick={onCancel}>
            Non, je modifie
          </StyledMainActionButton>
          <StyledMainActionButton
            variant="contained"
            onClick={onConfirm}
            primary
            autoFocus
          >
            Oui, je confirme
          </StyledMainActionButton>
        </ButtonsContainer>
      }
      {...props}
    />
  )
}

DeclarationSummaryDialog.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  declaration: PropTypes.object,
  employers: PropTypes.arrayOf(PropTypes.object),
}

export default DeclarationSummaryDialog
