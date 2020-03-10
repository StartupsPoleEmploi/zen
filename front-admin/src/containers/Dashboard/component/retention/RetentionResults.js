/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import superagent from 'superagent'
import { Spin } from 'antd'
import moment from 'moment'

function RetentionResults({ startMonth }) {
  const [values, setValues] = useState(null)

  useEffect(() => {
    if (!startMonth) return

    async function fetchData() {
      const { body } = await superagent.get(
        `/zen-admin-api/retention?start=${startMonth.id}`,
      )
      setValues(body)
    }
    fetchData()
  }, [startMonth])

  function formatMonth(month) {
    return moment(month).format('MMM YYYY')
  }

  function computePercentage(value, maximum) {
    return Math.floor((value / maximum) * 100)
  }

  if (!values) return <Spin />

  return (
    <div>
      <h2 style={{ marginTop: '2rem' }}>
        Sur les <strong>{values.baseUserNumber}</strong> utilisateurs ayant fait
        leur <strong>première actualisation</strong> en{' '}
        {formatMonth(startMonth.month)} :
      </h2>

      <ul>
        {values.nextMonths.map(({ month, value }) => (
          <li>
            <strong>{value}</strong> ont fait leur actualisation au mois{' '}
            {formatMonth(month)} --{' '}
            <strong>{computePercentage(value, values.baseUserNumber)}%</strong>
          </li>
        ))}
      </ul>

      <div
        style={{
          color: '#004085',
          backgroundColor: '#cce5ff',
          borderColor: '#b8daff',
          padding: '1rem',
          margin: '3rem 1rem 1rem 1rem',
        }}
      >
        Si la dernière période d'actualisation affichée est en cours de
        déroulement, le nombre d'actualisation effectué évoluera jusqu'à la fin
        de l'actualisation !
      </div>
    </div>
  )
}

export default RetentionResults
