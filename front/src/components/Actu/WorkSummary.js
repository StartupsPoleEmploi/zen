import Typography from '@material-ui/core/Typography'
import { isNaN as _isNaN } from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import NumberFormat from 'react-number-format'
import styled from 'styled-components'
import {
  WORK_HOURS,
  SALARY,
  MIN_SALARY,
  MIN_WORK_HOURS,
  MAX_SALARY,
  MAX_WORK_HOURS,
  calculateTotal,
} from '../../lib/salary'

const SummaryContainer = styled.div`
  padding-bottom: 1rem;
  text-align: center;
`

const SummaryNumber = styled.span`
  background: #f0f0f0;
  border-radius: 0.3rem;
  padding: 0 2rem;
`

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
      <Typography variant="body1">
        Heures déclarées :{' '}
        <SummaryNumber>
          {_isNaN(totalWorkHours) || totalWorkHours === 0
            ? '-'
            : totalWorkHours}
        </SummaryNumber>{' '}{' '}
        h
      </Typography>
      <Typography variant="body1">
        Salaire brut déclaré :{' '}
        <SummaryNumber>
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
        </SummaryNumber>
      </Typography>
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