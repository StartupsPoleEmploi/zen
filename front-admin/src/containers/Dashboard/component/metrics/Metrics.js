/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import superagent from 'superagent'
import { Spin } from 'antd'
import moment from 'moment'
import { ColumnChart } from 'react-chartkick'
import 'chart.js'

import './metrics.css'

function formatDate(date) {
  return moment(date).format('DD-MM')
}
function formatFrenchDate(date) {
  return moment(date).format('MMM YYYY')
}

function formatGraph(
  values,
  dateKey,
  accumulatedKey,
  firstDeclarationsMonth,
  secondDeclarationsMonth,
) {
  const graphData = [
    {
      name: `Actualisation ${formatFrenchDate(firstDeclarationsMonth.month)}`,
      data: values[dateKey][accumulatedKey].firstPeriod,
    },
  ]

  if (
    secondDeclarationsMonth &&
    firstDeclarationsMonth.id !== secondDeclarationsMonth.id
  ) {
    graphData[1] = {
      name: `Actualisation : ${formatFrenchDate(
        secondDeclarationsMonth.month,
      )}`,
      data: values[dateKey][accumulatedKey].secondPeriod,
    }
  }

  return graphData
}

function Metrics({ firstDeclarationsMonth, secondDeclarationsMonth }) {
  const [values, setValues] = useState(null)

  useEffect(() => {
    async function fetchData() {
      let url = `/zen-admin-api/metrics?firstMonthId=${firstDeclarationsMonth.id}`
      if (secondDeclarationsMonth) {
        url += `&secondMonthId=${secondDeclarationsMonth.id}`
      }

      const { body } = await superagent.get(url)
      setValues(body)
    }
    fetchData()
  }, [firstDeclarationsMonth, secondDeclarationsMonth])

  if (!values) return <Spin />

  // Compute graph values
  const newUsersGraph = formatGraph(
    values,
    'newUsers',
    'byDayResults',
    firstDeclarationsMonth,
    secondDeclarationsMonth,
  )
  const newUsersAccumultedGraph = formatGraph(
    values,
    'newUsers',
    'accumulatedResults',
    firstDeclarationsMonth,
    secondDeclarationsMonth,
  )
  const declarationStartedGraph = formatGraph(
    values,
    'declarationStarted',
    'byDayResults',
    firstDeclarationsMonth,
    secondDeclarationsMonth,
  )
  const declarationStartedAccumultedGraph = formatGraph(
    values,
    'declarationStarted',
    'accumulatedResults',
    firstDeclarationsMonth,
    secondDeclarationsMonth,
  )
  const declarationFinishedGraph = formatGraph(
    values,
    'declarationFinished',
    'byDayResults',
    firstDeclarationsMonth,
    secondDeclarationsMonth,
  )
  const declarationFinishedAccumulatedGraph = formatGraph(
    values,
    'declarationFinished',
    'accumulatedResults',
    firstDeclarationsMonth,
    secondDeclarationsMonth,
  )
  const filesTransmittedGraph = formatGraph(
    values,
    'filesTransmitted',
    'byDayResults',
    firstDeclarationsMonth,
    secondDeclarationsMonth,
  )
  const filesTransmittedAccumulatedGraph = formatGraph(
    values,
    'filesTransmitted',
    'accumulatedResults',
    firstDeclarationsMonth,
    secondDeclarationsMonth,
  )

  return (
    <>
      <div className="admin-chart" style={{ marginTop: '3rem' }}>
        <ColumnChart
          title="Premières connexions à Zen"
          data={newUsersGraph}
          download={`premieres-demarrees-${formatDate(new Date())}`}
        />
      </div>
      <div className="admin-chart" style={{ marginTop: '3rem' }}>
        <ColumnChart
          title="Total cumulé des premières connexions à Zen"
          data={newUsersAccumultedGraph}
          download={`total-cumule-premieres-demarrees-${formatDate(
            new Date(),
          )}`}
        />
      </div>
      <div className="admin-chart" style={{ marginTop: '3rem' }}>
        <ColumnChart
          title="Actualisations démarrées"
          data={declarationStartedGraph}
          download={`actualisations-demarrees-${formatDate(new Date())}`}
        />
      </div>
      <div className="admin-chart" style={{ marginTop: '3rem' }}>
        <ColumnChart
          title="Total cumulé des actualisations démarrées"
          data={declarationStartedAccumultedGraph}
          download={`total-cumule-actualisations-demarrees-${formatDate(
            new Date(),
          )}`}
        />
      </div>
      <div className="admin-chart" style={{ marginTop: '3rem' }}>
        <ColumnChart
          title="Actualisations terminées"
          data={declarationFinishedGraph}
          download={`actualisations-terminees-${formatDate(new Date())}`}
        />
      </div>
      <div className="admin-chart" style={{ marginTop: '3rem' }}>
        <ColumnChart
          title="Total cumulé des actualisations terminées"
          data={declarationFinishedAccumulatedGraph}
          download={`total-cumule-actualisations-terminees-${formatDate(
            new Date(),
          )}`}
        />
      </div>
      <div className="admin-chart" style={{ marginTop: '3rem' }}>
        <ColumnChart
          title="Dossiers complets"
          data={filesTransmittedGraph}
          download={`actualisations-validees-${formatDate(new Date())}`}
        />
      </div>
      <div className="admin-chart" style={{ marginTop: '3rem' }}>
        <ColumnChart
          title="Total cumulé des dossiers complets"
          data={filesTransmittedAccumulatedGraph}
          download={`total-cumule-actualisations-validees-${formatDate(
            new Date(),
          )}`}
        />
      </div>
    </>
  )
}

export default Metrics
