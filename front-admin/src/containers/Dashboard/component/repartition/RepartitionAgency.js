/* eslint-disable react/jsx-one-expression-per-line */
import React, { useEffect, useState } from 'react'
import superagent from 'superagent'
import { Button, Icon, Spin } from 'antd'
import moment from 'moment'
import { useHistory } from 'react-router-dom'
import { getAgence } from '../../../../common/agencesInfos'
import { URLS } from '../../../../common/routes'

import './Repartition.css'

function RepartitionAgency({ usersInAgency, agencyCode, declarationMonth }) {
  const [values, setValues] = useState(null)
  const [agency, setAgency] = useState(null)
  const history = useHistory()

  useEffect(() => {
    async function fetchData() {
      const agencyTemp = getAgence(agencyCode)
      if (!agencyTemp) return

      setAgency(agencyTemp)
      const { body } = await superagent.get(
        `/zen-admin-api/repartition/agency?agencyCode=${agencyCode}&monthId=${declarationMonth.id}`,
      )
      setValues(body)
    }
    fetchData()
  }, [agencyCode, setAgency, declarationMonth])

  if (!values) return <Spin />

  return (
    <div>
      <h1>
        {agency.nomAgence} dans {agency.departement} en {agency.region} (code
        agence : {agencyCode})
      </h1>
      <h2>
        Actualisation de {moment(declarationMonth.month).format('MMM YYYY')}
      </h2>
      {!values.length && <strong>Aucune actualisation trouvée</strong>}
      {values.length > 0 && (
        <>
          <h3 style={{ fontWeight: 'bold' }}>
            {values.length} actualisations réalisées -- {usersInAgency}{' '}
            assistantes maternelles présentes dans cette agence
          </h3>

          <ul className="ul download-list double">
            <li>
              <Button
                type="link"
                target="_blank"
                href={`/zen-admin-api/repartition/agency/csv?filter=actuDone&monthId=${declarationMonth.id}&agencyCode=${agencyCode}`}
              >
                Télécharger la liste des assistantes maternelles avec une
                actualisation terminée
              </Button>
            </li>
            <li>
              <Button
                type="link"
                target="_blank"
                href={`/zen-admin-api/repartition/agency/csv?filter=allUsers&agencyCode=${agencyCode}`}
              >
                Télécharger la liste des assistantes maternelles
              </Button>
            </li>
          </ul>

          <table style={{ width: '100%', marginTop: '3rem' }}>
            <thead>
              <tr>
                <th>Prénom & Nom</th>
                <th>Déclaration démarrée le :</th>
                <th>Voir la déclaration</th>
              </tr>
            </thead>
            <tbody>
              {values.map(
                ({ id, createdAt, user: { firstName, lastName } }) => (
                  <tr key={id}>
                    <td>
                      {firstName} {lastName}
                    </td>
                    <td>{moment(createdAt).format('DD-MM-YYYY')}</td>
                    <td>
                      <Button
                        onClick={() => history.push(URLS.DECLARATIONS.view(id))}
                      >
                        <Icon type="eye" style={{ color: 'blue' }} />
                      </Button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

export default RepartitionAgency
