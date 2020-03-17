/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import superagent from 'superagent'
import { Spin } from 'antd'
import moment from 'moment'

import { ColumnChart } from 'react-chartkick'
import 'chart.js'

import './metrics.css'


// prettier-ignore
const URLS = {
  'new-user': '/zen-admin-api/metrics/new-users',
  'declaration-started': '/zen-admin-api/metrics/declaration-started',
  'total-declaration-started': '/zen-admin-api/metrics/declaration-started',
  'declaration-employers-finished': '/zen-admin-api/metrics/declaration-finished',
  'total-declaration-employers-finished': '/zen-admin-api/metrics/declaration-finished',
  'declaration-files-end': '/zen-admin-api/metrics/files-end',
  'total-declaration-files-end': '/zen-admin-api/metrics/files-end',
};

const TITLES = {
  'new-user': 'Utilisateurs inscrits',
  'declaration-started': 'Actualisations démarrées',
  'total-declaration-started': 'Total actualisations démarrées',
  'declaration-employers-finished': 'Actualisations terminées',
  'total-declaration-employers-finished': 'Total actualisations terminées',
  'declaration-files-end': ' Actualisations terminées et fichier transmis',
  'total-declaration-files-end': 'Total actualisations terminées et fichier transmis',
};

function formatDate(date) {
  return moment(date).format('YYYY-MM-DD')
}
function formatFrenchDate(date) {
  return moment(date).format('DD-MM-YYYY')
}

function Metrics({ firstPeriodStart, secondPeriodStart, duration, data }) {
  const [values, setValues] = useState(null)

  useEffect(() => {
    async function fetchData() {
      let url = `${URLS[data]}?first=${formatDate(firstPeriodStart)}&second=${formatDate(secondPeriodStart)}&duration=${duration}`
      if (data.startsWith('total')) url += '&accumulate=true'

      const { body } = await superagent.get(url)
      setValues(body)
    }
    fetchData()
  }, [firstPeriodStart, secondPeriodStart, duration, data])

  if (!values) return <Spin />

  // Format data
  const graphData = [
    { name: `Depuis le ${formatFrenchDate(firstPeriodStart)}`, data: values.firstPeriod },
    { name: `Depuis le ${formatFrenchDate(secondPeriodStart)}`, data: values.secondPeriod },
  ]

  return (
    <>
      <div id="admin-chart" style={{ marginTop: '3rem' }}>
        <ColumnChart title={TITLES[data]} data={graphData} download={`${data}-${formatFrenchDate(new Date())}`} />
      </div>
    </>
  )
}

export default Metrics
