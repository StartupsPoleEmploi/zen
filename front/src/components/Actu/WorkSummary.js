import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Typography from '@material-ui/core/Typography'
import { isObject } from 'lodash'

const SummaryContainer = styled.div`
  position: fixed;
  width: 100%;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
  padding: 1rem;
  background-color: #253159;
  z-index: 1;
  text-align: center;
`

const SummaryTypography = styled(Typography)`
  && {
    color: #fff;
  }
`
const SummaryNumber = styled.span`
  background: #f0f0f0;
  color: #000;
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
  return Number.isNaN(total) || total === 0 ? '—' : total.toString()
}

const WorkSummary = ({ employers }) => (
  <SummaryContainer>
    <SummaryTypography variant="body2">
      Heures déclarées :{' '}
      <SummaryNumber>{calculateTotal(employers, 'workHours')}</SummaryNumber>
      {' '}
      h
    </SummaryTypography>
    <SummaryTypography variant="body2">
      Salaire brut déclaré :{' '}
      <SummaryNumber>{calculateTotal(employers, 'salary')}</SummaryNumber>
      {' '}
      €
    </SummaryTypography>
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
