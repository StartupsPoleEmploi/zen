import Typography from '@material-ui/core/Typography'
import { isNaN as _isNaN, isObject } from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import NumberFormat from 'react-number-format'
import styled from 'styled-components'

import { primaryBlue } from '../../constants'

import {
  WORK_HOURS,
  SALARY,
  MIN_SALARY,
  MIN_WORK_HOURS,
  MAX_SALARY,
  MAX_WORK_HOURS,
} from '../../lib/salary'

const SummaryContainer = styled.ul`
  padding: 0;
  width: 27rem;
  list-style: none;
  margin: auto auto 2rem auto;
`

const Label = styled(Typography).attrs({
  component: 'span',
})`
  && {
    display: inline-block;
    width: 18rem;
    line-height: 1.6rem;
  }
`

const Value = styled(Typography).attrs({
  component: 'span',
})`
  && {
    font-size: 1.5rem;
    padding-left: 1.5rem;
    border-left: solid 1px ${primaryBlue};
    display: inline-block;
  }
`

const calculateTotal = (employers, field, lowLimit, highLimit) => {
  const total = employers.reduce((prev, employer) => {
    const number = parseFloat(
      isObject(employer[field]) ? employer[field].value : employer[field],
    )
    if (number < lowLimit || number > highLimit) return NaN
    return number + prev
  }, 0)

  if (total < lowLimit || total > highLimit) return NaN

  return Math.round(total, 10)
}

const WorkSummary = ({ employers }) => {
  const totalWorkHours = calculateTotal(
    employers,
    WORK_HOURS,
    MIN_WORK_HOURS,
    MAX_WORK_HOURS,
  )
  const totalSalary = calculateTotal(employers, SALARY, MIN_SALARY, MAX_SALARY)

  return (
    <SummaryContainer>
      <li className="work-hours-total">
        <Label>Heures déclarées : </Label>

        <Value style={{ paddingBottom: '0.5rem' }}>
          <b>
            {_isNaN(totalWorkHours) || totalWorkHours === 0
              ? '-'
              : totalWorkHours}
          </b>
          {' '}h
        </Value>
      </li>

      <li className="salary-total">
        <Label>Salaire brut déclaré : </Label>
        <Value>
          <b>
            {_isNaN(totalSalary) || totalSalary === 0 ? (
              '-'
            ) : (
              <NumberFormat
                thousandSeparator=" "
                decimalSeparator=","
                decimalScale={0}
                fixedDecimalScale
                displayType="text"
                value={totalSalary}
              />
            )}
          </b>
          {' '}€
        </Value>
      </li>
    </SummaryContainer>
  )
}

WorkSummary.propTypes = {
  employers: PropTypes.arrayOf(
    PropTypes.shape({
      workHours: PropTypes.oneOfType([
        PropTypes.shape({
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        }), // can be an object from Employers form
        PropTypes.number,
      ]),
      salary: PropTypes.oneOfType([
        PropTypes.shape({
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        }), // can be an object from Employers form
        PropTypes.number,
      ]),
    }),
  ),
}

export default WorkSummary
