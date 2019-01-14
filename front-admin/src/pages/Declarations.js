import React, { Fragment, useState, useEffect } from 'react'
import superagent from 'superagent'
import { format } from 'date-fns'
import DeclarationsTable from '../components/DeclarationsTable'

export const Declarations = () => {
  const [availableMonths, setAvailableMonths] = useState([])
  const [selectedMonthId, setSelectedMonthId] = useState(null)
  const [declarations, setDeclarations] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    superagent.get(`/zen-admin-api/declarationsMonths`).then(({ body }) => {
      setAvailableMonths(body)
      setSelectedMonthId(body[0].id)
    })
  }, [])

  useEffect(
    () => {
      if (!selectedMonthId) return
      setIsLoading(true)

      superagent
        .get(`/zen-admin-api/declarations?monthId=${selectedMonthId}`)
        .then(({ body }) => {
          setDeclarations(body)
          setIsLoading(false)
        })
    },
    [selectedMonthId],
  )

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Actualisations</h1>
      <select onChange={(event) => setSelectedMonthId(event.target.value)}>
        {availableMonths.map((month) => (
          <option key={month.id} value={month.id}>
            {format(month.month, 'MMMM YYYY')}
          </option>
        ))}
      </select>
      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <Fragment>
          <p>
            Actualisation débutée : {declarations.length}
            <br />
            Actualisation terminée:{' '}
            {
              declarations.filter(
                ({ hasFinishedDeclaringEmployers }) =>
                  hasFinishedDeclaringEmployers,
              ).length
            }
            <br />
            Documents validés :{' '}
            {declarations.filter(({ isFinished }) => isFinished).length}
            <br />
          </p>
          <DeclarationsTable declarations={declarations} />
        </Fragment>
      )}
    </div>
  )
}

Declarations.propTypes = {}

export default Declarations
