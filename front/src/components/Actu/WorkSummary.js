import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Typography from '@material-ui/core/Typography'
import { isNaN as _isNaN, isObject } from 'lodash'

const SummaryContainer = styled.div`
  padding-bottom: 1rem;
  text-align: center;
`

const SummaryNumber = styled.span`
  background: #f0f0f0;
  border-radius: 0.3rem;
  padding: 0 2rem;
`

const calculateTotal = (employers, field) => {
  const total = employers.reduce(
    (prev, employer) =>
      parseInt(
        isObject(employer[field]) ? employer[field].value : employer[field],
        10,
      ) + prev,
    0,
  )
  return _isNaN(total) || total === 0 ? '—' : total.toString()
}

const WorkSummary = ({ employers }) => (
  <SummaryContainer>
    <Typography variant="body2">
      Heures déclarées :{' '}
      <SummaryNumber>{calculateTotal(employers, 'workHours')}</SummaryNumber>
      {' '}
      h
    </Typography>
    <Typography variant="body2">
      Salaire brut déclaré :{' '}
      <SummaryNumber>{calculateTotal(employers, 'salary')}</SummaryNumber>
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
