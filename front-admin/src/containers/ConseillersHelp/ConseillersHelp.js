import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { Spin } from 'antd'
import superagent from 'superagent'

import ZnContent from '../../components/ZnContent'
import ZnHeader from '../../components/ZnHeader'
import ZnTable from '../../components/ZnTable'

const COLUMNS = [
  { title: 'Id', dataIndex: 'id' },
  { title: 'Email', dataIndex: 'email' },
  {
    title: 'Date',
    dataIndex: 'createdAt',
    render: (text) => moment(text).format('DD-MM-YYYY HH:ss'),
  },
]

export default function ConseillersHelp() {
  const [isLoading, setIsLoading] = useState(true)
  const [conseillerHelps, setConseillersHelp] = useState([])

  useEffect(() => {
    async function fetchData() {
      const { body } = await superagent.get('/zen-admin-api/conseiller-helps')
      setConseillersHelp(body)
      setIsLoading(false)
    }

    fetchData()
  }, [setIsLoading, setConseillersHelp])

  if (isLoading) {
    return (
      <div className="conseillers-help" style={{ textAlign: 'center' }}>
        <ZnHeader title="Aide conseillers" />

        <ZnContent>
          <Spin />
        </ZnContent>
      </div>
    )
  }

  return (
    <div className="conseillers-help" style={{ textAlign: 'center' }}>
      <ZnHeader title="Aide conseillers" />

      <ZnContent>
        {!conseillerHelps.length && <p>Aucune demande enregistrée !</p>}

        {conseillerHelps.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <ZnTable
              rowKey="id"
              size="small"
              style={{ backgroundColor: 'white' }}
              columns={COLUMNS}
              dataSource={conseillerHelps}
            />
          </div>
        )}
      </ZnContent>
    </div>
  )
}
