/* eslint-disable react/jsx-one-expression-per-line */
import React, { useEffect, useState } from 'react'
import superagent from 'superagent'
import slug from 'slug'
import { Spin } from 'antd'

import { getAgence } from '../../../../common/agencesInfos'

import './Repartition.css'

function RepartitionRegionDepartment({
  region,
  department,
  declarationMonth,

  selectRegion,
  selectDepartment,
  selectAgency,
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [franceTotal, setFranceTotal] = useState(0)
  const [byRegionTotal, setByRegion] = useState({})
  const [byDepartmentTotal, setByDepartment] = useState({})
  const [byAgencyTotal, setByAgency] = useState({})

  function computeDeclarationHierarchy(declarations) {
    const regionsTotal = {}
    const departmentsTotal = {}
    const agencyTotal = {}

    declarations.forEach(({ user }) => {
      const { region: reg, departement: dep, nomAgence } = getAgence(
        user.agencyCode,
      )

      // Region
      if (!regionsTotal[reg]) regionsTotal[reg] = 0
      regionsTotal[reg] += 1

      // Department
      if (!departmentsTotal[dep]) departmentsTotal[dep] = 0
      departmentsTotal[dep] += 1

      // Agency
      const name = `${user.agencyCode} - ${nomAgence}` // The '-' is important
      if (!agencyTotal[name]) agencyTotal[name] = 0
      agencyTotal[name] += 1
    })

    setFranceTotal(declarations.length)
    setByRegion(regionsTotal)
    setByDepartment(departmentsTotal)
    setByAgency(agencyTotal)
    setTimeout(() => setIsLoading(false), 500)
  }

  function doSelectRegion(e) {
    selectRegion(e.target.getAttribute('data-region'))
  }
  function doSelectDepartment(e) {
    selectDepartment(e.target.getAttribute('data-department'))
  }
  function doSelectAgency(e) {
    selectAgency(e.target.getAttribute('data-agency'))
  }

  useEffect(() => {
    // prettier-ignore
    async function fetchData() {
      setIsLoading(true)
      let url = `/zen-admin-api/declarations?monthId=${declarationMonth.id}`
      if (department) url = `/zen-admin-api/repartition/department?department=${slug(department, { lower: true })}&monthId=${declarationMonth.id}`
      else if (region) url = `/zen-admin-api/repartition/region?region=${slug(region, { lower: true })}&monthId=${declarationMonth.id}`

      const { body } = await superagent.get(url)
      computeDeclarationHierarchy(body)
    }
    fetchData()
  }, [region, department, declarationMonth])

  if (isLoading) return <Spin />

  return (
    <div>
      <h1>
        Répartition pour
        {department ? ` le département ${department}` : null}
        {region && !department ? ` la region ${region}` : null}
        {!region && !department ? ' la France entière' : null}
      </h1>

      {/* No region selected ? we can display the repartition for all the regions */}
      {!region && (
        <>
          <h2 className="h2">France entière</h2>
          <p>Total de {franceTotal} actualisations</p>

          <h2 className="h2">Par régions</h2>
          <p className="subtitle">
            Les régions sans actualisation ne sont pas listées
          </p>
          <ul className="ul">
            {Object.entries(byRegionTotal).map(([regionName, total]) => (
              <li key={regionName}>
                <button
                  onClick={doSelectRegion}
                  data-region={regionName}
                  type="button"
                  title="En savoir plus pour cette région"
                >
                  {regionName} : {total} actualisations (soit{' '}
                  {((total / franceTotal) * 100).toFixed(2)}%)
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* No department selected ? we can display the repartition for all the departments */}
      {!department && (
        <>
          <h2 className="h2">Par département</h2>
          <p className="subtitle">
            Les départements sans actualisation ne sont pas listés
          </p>
          <ul className="ul">
            {Object.entries(byDepartmentTotal).map(
              ([departmentName, total]) => (
                <li key={departmentName}>
                  <button
                    onClick={doSelectDepartment}
                    data-department={departmentName}
                    type="button"
                    title="En savoir plus pour ce département"
                  >
                    {departmentName} : {total} actualisations (soit{' '}
                    {((total / franceTotal) * 100).toFixed(2)}%)
                  </button>
                </li>
              ),
            )}
          </ul>
        </>
      )}

      <h2 className="h2">Par agence</h2>
      <p className="subtitle">
        Les agences sans actualisation ne sont pas listées
      </p>
      <ul className="ul">
        {Object.entries(byAgencyTotal).map(([agenceName, total]) => (
          <li key={agenceName}>
            <button
              onClick={doSelectAgency}
              data-agency={agenceName}
              type="button"
              title="En savoir plus sur cette agence"
            >
              {agenceName} : {total} actualisations (soit{' '}
              {((total / franceTotal) * 100).toFixed(2)}%)
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default RepartitionRegionDepartment
