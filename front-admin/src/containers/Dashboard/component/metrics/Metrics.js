/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import superagent from 'superagent'
import { Spin } from 'antd'
import moment from 'moment'

import { LineChart } from 'react-chartkick'
import 'chart.js'

// prettier-ignore
const URLS = {
  'new-user': '/zen-admin-api/metrics/new-users',
  'declaration-started': '/zen-admin-api/metrics/declaration-started',
  'declaration-employers-finished': '/zen-admin-api/metrics/declaration-finished',
  'declaration-files-end': '/zen-admin-api/metrics/files-end',
};

function formatDate(date) {
  return moment(date).format('YYYY-MM-DD')
}

function Metrics({ firstPeriodStart, secondPeriodStart, duration, data }) {
  const [values, setValues] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const { body } = await superagent.get(
        `${URLS[data]}?first=${formatDate(
          firstPeriodStart,
        )}&second=${formatDate(secondPeriodStart)}&duration=${duration}`,
      )
      setValues(body)
    }
    fetchData()
  }, [firstPeriodStart, secondPeriodStart, duration, data])

  if (!values) return <Spin />

  // Format data
  const graphData = [
    { name: 'Première période', data: values.firstPeriod },
    { name: 'Seconde période', data: values.secondPeriod },
  ]

  return (
    <>
      <div style={{ marginTop: '3rem' }}>
        <LineChart data={graphData} />
      </div>
    </>
  )
}

export default Metrics
