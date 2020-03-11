/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react'
import { DatePicker, InputNumber, Select } from 'antd'
import Metrics from './Metrics'

function MetricsForm() {
  const [firstPeriodStart, setFirstPeriodStart] = useState(null)
  const [secondPeriodStart, setSecondPeriodStart] = useState(null)
  const [duration, setDuration] = useState(1) // in weeks
  const [data, setData] = useState('') // in weeks

  return (
    <div>
      <div
        style={{
          color: '#004085',
          backgroundColor: '#cce5ff',
          borderColor: '#b8daff',
          padding: '1rem',
          margin: '1rem 1rem 3rem 1rem',
        }}
      >
        Cette page vous permet de comparer deux périodes temporels sur une
        plusieurs semaines autour d'un évènements particuliers
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          margin: '30px auto',
        }}
      >
        <div>
          <label htmlFor="first-period">
            Date de début de la 1<up>ère</up> période:
          </label>
          <DatePicker
            style={{ width: '150px', marginLeft: '1rem' }}
            onChange={setFirstPeriodStart}
          />
        </div>

        <div>
          <label htmlFor="second-period">
            Date de début de la 2<up>ème</up> période:
          </label>
          <DatePicker
            style={{ width: '150px', marginLeft: '1rem' }}
            onChange={setSecondPeriodStart}
          />
        </div>

        <div>
          <label htmlFor="duration">Durée (en semaines):</label>
          <InputNumber
            style={{ width: '75px', marginLeft: '1rem' }}
            min={1}
            max={10}
            defaultValue={duration}
            onChange={setDuration}
          />
        </div>

        <div>
          Données à afficher :
          <Select
            id="start-period"
            style={{ width: '300px', marginLeft: '1rem' }}
            value={data}
            onChange={setData}
          >
            <Select.Option value=""></Select.Option>
            <Select.Option value="new-user">
              Utilisateurs inscrits
            </Select.Option>
            <Select.Option value="declaration-started">
              Actualisations démarrées
            </Select.Option>
            <Select.Option value="total-declaration-started">
              Total actualisations démarrées
            </Select.Option>
            <Select.Option value="declaration-employers-finished">
              Actualisations terminées
            </Select.Option>
            <Select.Option value="total-declaration-employers-finished">
              Total actualisations terminées
            </Select.Option>
            <Select.Option value="declaration-files-end">
              Actualisations terminées et fichier transmis
            </Select.Option>
            <Select.Option value="total-declaration-files-end">
              Total actualisations terminées et fichier transmis
            </Select.Option>
          </Select>
        </div>
      </div>

      {firstPeriodStart && secondPeriodStart && duration && data !== '' && (
        <div style={{ margin: '2rem auto' }}>
          <Metrics
            firstPeriodStart={firstPeriodStart}
            secondPeriodStart={secondPeriodStart}
            duration={duration}
            data={data}
          />
        </div>
      )}
    </div>
  )
}

export default MetricsForm
