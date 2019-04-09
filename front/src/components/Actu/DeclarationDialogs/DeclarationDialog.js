import React, { Component, Fragment } from 'react'

import Button from '@material-ui/core/Button'
import DialogContentText from '@material-ui/core/DialogContentText'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { isNaN as _isNaN, isEmpty } from 'lodash'
import NumberFormat from 'react-number-format'

import CustomColorButton from '../../Generic/CustomColorButton'
import CustomDialog from '../../Generic/CustomDialog'

import LoadingDialog from './LoadingDialog'
import ErrorsDialog from './ErrorsDialog'
import ConsistencyErrorsDialogs from './ConsistencyErrorsDialog'
import {
  formattedDeclarationMonth,
  formatIntervalDates,
} from '../../../lib/date'
import { types } from '../../../pages/actu/Actu'
import {
  MIN_SALARY,
  SALARY,
  MAX_SALARY,
  calculateTotal,
} from '../../../lib/salary'

const StyledDialogContentText = styled(DialogContentText)`
  && {
    padding-bottom: 30px;
    border-bottom: solid 2px #f2f2f2;
    margin-left: -24px;
    margin-right: -24px;
    margin-bottom: 25px;
    padding: 0 50px 20px 50px;
    color: black;
  }
`

const DeclarationContent = styled(DialogContentText).attrs({
  component: 'div',
})`
  margin: auto !important;
  max-width: 290px;
  text-align: left;
  padding-bottom: 30px;
`

const DeclarationHeader = styled.div`
  font-weight: bold;
  color: black;
  margin-top: 20px;
  text-transform: uppercase;
`
const DeclarationValues = styled.p`
  font-weight: bold;
  color: #37669f;
  margin: 0;
`

const DeclarationList = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
  font-weight: bold;
  color: #37669f;
`

class DeclarationDialog extends Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    isOpened: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    consistencyErrors: PropTypes.arrayOf(PropTypes.string).isRequired,
    validationErrors: PropTypes.arrayOf(PropTypes.string).isRequired,
    declaration: PropTypes.object,
    employers: PropTypes.arrayOf(PropTypes.object),
  }

  confirm = () => this.props.onConfirm()

  confirmAndIgnoreErrors = () => this.props.onConfirm({ ignoreErrors: true })

  render() {
    const {
      isLoading,
      isOpened,
      consistencyErrors,
      validationErrors,
      onCancel,
      declaration,
      employers,
    } = this.props

    const defaultProps = {
      title: "Envoi de l'actualisation",
      titleId: 'ActuDialogContentText',
      isOpened,
      onCancel,
    }

    if (isLoading) {
      return <LoadingDialog defaultProps={defaultProps} />
    }

    if (validationErrors.length > 0) {
      return (
        <ErrorsDialog
          validationErrors={validationErrors}
          onCancel={onCancel}
          defaultProps={defaultProps}
        />
      )
    }

    if (consistencyErrors.length > 0) {
      return (
        <ConsistencyErrorsDialogs
          consistencyErrors={consistencyErrors}
          onCancel={onCancel}
          confirmAndIgnoreErrors={this.confirmAndIgnoreErrors}
          defaultProps={defaultProps}
        />
      )
    }

    // No current declaration
    if (isEmpty(declaration)) return null

    const sickLeaves = declaration.infos.filter(
      (info) => info.type === types.SICK_LEAVE,
    )
    const interships = declaration.infos.filter(
      (info) => info.type === types.INTERNSHIP,
    )

    const totalSalary = calculateTotal(
      employers,
      SALARY,
      MIN_SALARY,
      MAX_SALARY,
    )

    return (
      <CustomDialog
        content={
          <Fragment>
            <StyledDialogContentText id="ActuDialogContentText">
              Voici le récapitulatif de votre actualisation pour le mois de{' '}
              <strong>
                {formattedDeclarationMonth(declaration.declarationMonth.month)}
              </strong>
              , est-il exact ou complet ?
            </StyledDialogContentText>

            <DeclarationContent>
              {employers.length && (
                <div>
                  <DeclarationHeader>
                    {employers.length}{' '}
                    {employers.length >= 2 ? 'employeurs' : 'employeur'}
                  </DeclarationHeader>
                  <DeclarationList>
                    {employers.map((employer) => (
                      <li key={employer.employerName.value}>
                        {employer.employerName.value}
                      </li>
                    ))}
                  </DeclarationList>
                </div>
              )}

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
                      decimalScale={2}
                      fixedDecimalScale
                      displayType="text"
                      suffix=" €"
                      value={totalSalary}
                    />
                  )}
                </DeclarationValues>
              </div>

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
                    {sickLeaves.length >= 2
                      ? 'arrêts maladie'
                      : 'arrêt maladie'}
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
            </DeclarationContent>
          </Fragment>
        }
        actions={
          <Fragment>
            <CustomColorButton onClick={onCancel}>
              Non, je modifie
            </CustomColorButton>
            <Button
              variant="contained"
              onClick={this.confirm}
              color="primary"
              autoFocus
            >
              Oui, je confirme
            </Button>
          </Fragment>
        }
        {...defaultProps}
      />
    )
  }
}

export default DeclarationDialog
