/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react'
import { Select, Spin } from 'antd'
import superagent from 'superagent'
import moment from 'moment'

import Metrics from './Metrics'

function MetricsForm() {
  const [declarationMonths, setDeclarationMonths] = useState(null)
  const [firstDeclarationMonth, setFirstDeclarationMonth] = useState(null)
  const [secondDeclarationMonth, setSecondDeclarationMonth] = useState(null)

  // Get declaration months at start
  useEffect(() => {
    async function fetchData() {
      const { body } = await superagent.get('/zen-admin-api/declarationsMonths')
      setDeclarationMonths(body)
    }
    fetchData()
  }, [])

  if (declarationMonths === null) return <Spin />

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          margin: '30px auto',
        }}
      >
        <div>
          <label htmlFor="start-period">Actualisation 1 :</label>
          <Select
            id="start-period"
            style={{ width: '150px', marginLeft: '2rem' }}
            value={firstDeclarationMonth}
            onChange={setFirstDeclarationMonth}
          >
            {declarationMonths.map((month) => (
              <Select.Option key={month.id} value={month.id}>
                {moment(month.month).format('MMM YYYY')}
              </Select.Option>
            ))}
          </Select>
        </div>{' '}
        <div>
          <label htmlFor="start-period">Actualisation 2 :</label>
          <Select
            id="start-period"
            style={{ width: '150px', marginLeft: '2rem' }}
            value={secondDeclarationMonth}
            onChange={setSecondDeclarationMonth}
          >
            {declarationMonths.map((month) => (
              <Select.Option key={month.id} value={month.id}>
                {moment(month.month).format('MMM YYYY')}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      {firstDeclarationMonth && (
        <Metrics
          firstDeclarationsMonth={declarationMonths.find(
            (d) => d.id === firstDeclarationMonth,
          )}
          secondDeclarationsMonth={
            secondDeclarationMonth
              ? declarationMonths.find((d) => d.id === secondDeclarationMonth)
              : null
          }
        />
      )}
    </div>
  )
}

export default MetricsForm
