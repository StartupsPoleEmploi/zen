/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react'
import superagent from 'superagent'
import { Select } from 'antd'
import moment from 'moment'

import RetentionResults from './RetentionResults'

function UserRetention() {
  const [declarationsMonthStart, setDeclarationsMonthStart] = useState([])
  const [periodStart, setPeriodStart] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const { body } = await superagent.get('/zen-admin-api/declarationsMonths')
      setDeclarationsMonthStart(body)
      // We don't take body[1] to get at least one month of retention
      setPeriodStart(body[1].id)
    }
    fetchData()
  }, [])

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '30px auto',
        }}
      >
        <label htmlFor="start-period">Actualisation de début :</label>
        <Select
          id="start-period"
          style={{ width: '150px', marginLeft: '2rem' }}
          value={periodStart}
          onChange={setPeriodStart}
        >
          {declarationsMonthStart.map((month) => (
            <Select.Option key={month.id} value={month.id}>
              {moment(month.month).format('MMM YYYY')}
            </Select.Option>
          ))}
        </Select>
      </div>

      <div>
        <RetentionResults
          startMonth={declarationsMonthStart.find((m) => m.id === periodStart)}
        />
      </div>
    </div>
  )
}

export default UserRetention
