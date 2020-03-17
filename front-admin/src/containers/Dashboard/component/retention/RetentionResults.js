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
        `/zen-admin-api/retention?monthId=${startMonth.id}`,
      )
      setValues(body)
    }
    fetchData()
  }, [startMonth])

  function formatMonth(month) {
    return moment(month).format('MMM YYYY')
  }
  function formatDateInterval(month) {
    return `${moment(month.startDate).format('DD/MM/YYYY')} au ${moment(
      month.endDate,
    ).format('DD/MM/YYYY')}`
  }

  function computePercentage(value, maximum) {
    return Math.floor((value / maximum) * 100)
  }

  if (!values) return <Spin />

  return (
    <>
      <div>
        <h2>Premières connexions</h2>
        <p>
          <ul>
            <li>
              <strong>{values.firstLoginUserCount} personnes</strong> ont fait
              leur première connexion durant cette actualisation (
              {formatDateInterval(startMonth)})
            </li>
            <li>
              <strong> {values.firstDeclarationLess24h} personnes</strong> ont
              débuté leur actualisation <strong>dans les 24h</strong> qui ont
              suivi leur première connexion
            </li>
            <li>
              <strong>
                {values.employerFinishedDeclarationLess24h} personnes
              </strong>{' '}
              ont terminé leur actualisation <strong>dans les 24h</strong> qui
              ont suivi leur première connexion
            </li>
            <li>
              <strong>
                {values.validateAllFilesDeclarationLess24h} personnes
              </strong>{' '}
              ont terminé leur actualisation et envoyés tous leurs justificatifs{' '}
              <strong>dans les 24h</strong> qui ont suivi leur première
              connexion
            </li>
          </ul>
        </p>

        <hr />
        <h2 style={{ marginTop: '2rem' }}>
          Sur les <strong>{values.baseUserNumber}</strong> utilisateurs ayant
          fait leur <strong>première actualisation</strong> en{' '}
          {formatMonth(startMonth.month)} :
        </h2>
        <p>
          {values.oneDeclarationInSixMonths} ont fait{' '}
          <strong>au moins une actualisation</strong> dans les six mois suivants
          --{' '}
          <strong>
            {computePercentage(
              values.oneDeclarationInSixMonths,
              values.baseUserNumber,
            )}
            %
          </strong>
        </p>
      </div>
      <hr />
      <div>
        <h2 style={{ marginTop: '2rem' }}>
          Sur les <strong>{values.baseUserNumber}</strong> utilisateurs ayant
          fait leur <strong>première actualisation</strong> en{' '}
          {formatMonth(startMonth.month)} :
        </h2>

        <ul>
          {values.nextMonths.map(({ month, value }) => (
            <li>
              <strong>{value}</strong> ont fait leur actualisation au mois{' '}
              {formatMonth(month)} --{' '}
              <strong>
                {computePercentage(value, values.baseUserNumber)}%
              </strong>
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
          déroulement, le nombre d'actualisation effectué évoluera jusqu'à la
          fin de l'actualisation !
        </div>
      </div>
    </>
  )
}

export default RetentionResults
