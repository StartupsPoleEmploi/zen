import React, { useState, useEffect } from 'react'
import superagent from 'superagent'
import { format } from 'date-fns'

export const Declarations = (props) => {
  const [availableMonths, setAvailableMonths] = useState([])
  const [selectedMonthId, setSelectedMonthId] = useState(null)
  const [declarations, setDeclarations] = useState([])
  console.log(availableMonths, selectedMonthId)

  useEffect(() => {
    superagent
      .get(`/zen-admin-api/declarationsMonths`)
      .then(({ body }) => setAvailableMonths(body))
  }, [])

  useEffect(
    () => {
      if (!selectedMonthId) return

      superagent
        .get(`/zen-admin-api/declarations/${selectedMonthId}`)
        .then(({ body }) => setDeclarations(body))
    },
    [selectedMonthId],
  )

  return (
    <div>
      <ul>
        {availableMonths.map((month) => (
          <li onClick={() => setSelectedMonthId(month.id)}>
            {format(month.month, 'MM/YY')}
          </li>
        ))}
      </ul>
      <h1>Declarations</h1>
      <div>Pim pam poum</div>
    </div>
  )
}

Declarations.propTypes = {}

export default Declarations
