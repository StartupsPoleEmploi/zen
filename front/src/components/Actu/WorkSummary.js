import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Typography from '@material-ui/core/Typography'
import { isNaN as _isNaN, isObject } from 'lodash'

// Note : these values are duplicated in Employers
const WORK_HOURS = 'workHours'
const SALARY = 'salary'
const MIN_SALARY = 1
const MIN_WORK_HOURS = 1
const MAX_SALARY = 99999
const MAX_WORK_HOURS = 1000

const SummaryContainer = styled.div`
  padding-bottom: 1rem;
  text-align: center;
`

const SummaryNumber = styled.span`
  background: #f0f0f0;
  border-radius: 0.3rem;
  padding: 0 2rem;
`

const calculateTotal = (employers, field, lowLimit, highLimit) => {
  const total = employers.reduce((prev, employer) => {
    const number = parseInt(
      isObject(employer[field]) ? employer[field].value : employer[field],
      10,
    )
    if (number < lowLimit || number > highLimit) return NaN
    return number + prev
  }, 0)
  return _isNaN(total) || total === 0 ? '—' : total.toString()
}

const WorkSummary = ({ employers }) => (
  <SummaryContainer>
    <Typography variant="body2">
      Heures déclarées :{' '}
      <SummaryNumber>
        {calculateTotal(employers, WORK_HOURS, MIN_WORK_HOURS, MAX_WORK_HOURS)}
      </SummaryNumber>
      {' '}
      h
    </Typography>
    <Typography variant="body2">
      Salaire brut déclaré :{' '}
      <SummaryNumber>
        {calculateTotal(employers, SALARY, MIN_SALARY, MAX_SALARY)}
      </SummaryNumber>
      {' '}
      €
    </Typography>
  </SummaryContainer>
)

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
