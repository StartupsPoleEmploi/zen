/* eslint-disable no-restricted-syntax */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react'
import superagent from 'superagent'
import { Select, Spin } from 'antd'
import moment from 'moment'
import slug from 'slug'

import updateUrl, { getUrlParams } from '../../../../components/history'
import RepartitionAgency from './RepartitionAgency'
import {
  getHierarchicAgences,
  getAllDepartments,
  getAllAgencies,
  getAgence,
  departmentsSlugToName,
  regionsSlugToName,
} from '../../../../common/agencesInfos'
import RepartitionRegionDepartment from './RepartitionRegionDepartment'

// Get regions
const agencesTree = getHierarchicAgences()
const allRegions = Object.keys(agencesTree)
const allDepartments = getAllDepartments()
const allAgencies = getAllAgencies()

// UTILS
function extractAgenciesFromRegion(regionSelected) {
  const filteredAgencies = []
  Object.entries(agencesTree[regionSelected]).forEach(
    ([, departmentAgencies]) => {
      filteredAgencies.push(...Object.values(departmentAgencies))
    },
  )
  return filteredAgencies
}

function extractRegionFromDepartment(department) {
  for (const [region, departments] of Object.entries(agencesTree)) {
    for (const [departmentName] of Object.entries(departments)) {
      if (department === departmentName) return region
    }
  }
  return ''
}

function extractAgenciesFromDepartement(departmentSelected) {
  const reg = extractRegionFromDepartment(departmentSelected)
  const filteredAgencies = []
  Object.entries(agencesTree[reg][departmentSelected]).forEach(
    ([, agencies]) => {
      filteredAgencies.push(agencies)
    },
  )
  return filteredAgencies
}

function extractAgencyCode(agencyLabel) {
  return agencyLabel.split('-')[0].trim()
}

// prettier-ignore
function updateUrlParams({ period, agency, department, region }) {
  if (period) {
    const base = `/zen-admin?activeTab=repartition&period=${period}`
    if (agency) updateUrl(`${base}&agency=${extractAgencyCode(agency)}`)
    else if (department) updateUrl(`${base}&department=${slug(department, { lower: true })}`)
    else if (region) updateUrl(`${base}&region=${slug(region, { lower: true })}`)
  } else updateUrl('/zen-admin?activeTab=repartition')
}
// END UTILS

function RepartitionForm() {
  const [declarationsMonth, setDeclarationsMonth] = useState([])
  const [period, setPeriod] = useState(null)

  const [region, setRegion] = useState('')
  const [department, setDepartment] = useState('')
  const [departmentsToDisplay, setDepartmentsToDisplay] = useState(
    allDepartments,
  )
  const [agency, setAgency] = useState('')
  const [agenciesToDisplay, setAgenciesToDisplay] = useState(allAgencies)
  const [usersGlobalRepartition, setUsersGlobalRepartition] = useState(null)
  const [formsInitDone, setFormsInitDone] = useState(false)

  // Get global users repartition
  useEffect(() => {
    async function fetchData() {
      const { body } = await superagent.get('/zen-admin-api/repartition/global')
      setUsersGlobalRepartition(body)
    }
    fetchData()
  }, [])

  // Get declaration months at start
  useEffect(() => {
    async function fetchData() {
      const { body } = await superagent.get('/zen-admin-api/declarationsMonths')
      setDeclarationsMonth(body)
      setPeriod(getUrlParams('period') || body[0].id)
    }
    fetchData()
  }, [])

  // Update URL when values change
  useEffect(() => {
    if (formsInitDone) {
      updateUrlParams({ agency, department, region, period })
    }
  }, [agency, department, region, period, formsInitDone])

  // When a region is selected => update departement + agencies
  function selectRegionValue(regionSelected) {
    if (regionSelected === '') {
      setRegion('')
      setDepartment('')
      setDepartmentsToDisplay(allDepartments)
      setAgency('')
      setAgenciesToDisplay(allAgencies)
      return
    }

    // Nothing to do
    if (regionSelected === region) return

    setRegion(regionSelected)

    const filteredDepartment = Object.keys(agencesTree[regionSelected])
    setDepartmentsToDisplay(filteredDepartment)
    if (!department.includes(filteredDepartment)) setDepartment('')

    const filteredAgencies = extractAgenciesFromRegion(regionSelected)
    setAgenciesToDisplay(filteredAgencies)
    if (!agency.includes(filteredAgencies)) setAgency('')
  }

  // Select departement
  function selectDepartmentValue(departmentSelected) {
    if (departmentSelected === '') {
      setDepartment('')
      setAgenciesToDisplay(
        region ? extractAgenciesFromRegion(region) : allAgencies,
      )
      setAgency('')
      return
    }

    // Nothing to do
    if (departmentSelected === department) return

    setRegion(extractRegionFromDepartment(departmentSelected))
    setDepartment(departmentSelected)

    const filteredAgencies = extractAgenciesFromDepartement(departmentSelected)
    setAgenciesToDisplay(filteredAgencies)
    if (!agency.includes(filteredAgencies)) setAgency('')
  }

  // Select agency
  function selectAgencyValue(agencySelected) {
    if (agencySelected === '') {
      setAgency('')
      return
    }

    if (agencySelected === agency) return

    const codeAgence = extractAgencyCode(agencySelected)
    const { region: reg, departement: dep } = getAgence(codeAgence)

    setRegion(reg)
    setDepartmentsToDisplay(Object.keys(agencesTree[reg]))
    setDepartment(dep)
    setAgency(agencySelected)
    setAgenciesToDisplay(extractAgenciesFromDepartement(dep))
  }

  // Initialize form data based on value in URL
  useEffect(() => {
    const agencyCode = getUrlParams('agency')
    const departmentSlug = getUrlParams('department')
    const regionSlug = getUrlParams('region')
    if (agencyCode) {
      const agence = getAgence(agencyCode)
      if (agence) selectAgencyValue(`${agencyCode} - ${agence.nomAgence}`)
    } else if (departmentSlug) {
      const dep = departmentsSlugToName[departmentSlug]
      if (dep) selectDepartmentValue(dep)
    } else if (regionSlug) {
      const reg = regionsSlugToName[regionSlug]
      if (reg) selectRegionValue(reg)
    }
    setTimeout(() => setFormsInitDone(true), 500)
  }, [
    selectAgencyValue,
    selectDepartmentValue,
    selectRegionValue,
    setFormsInitDone,
  ])

  const declarationMonth = period
    ? declarationsMonth.find((d) => d.id === period)
    : null

  const agencyCode = extractAgencyCode(agency)

  if (usersGlobalRepartition === null) return <Spin />

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          margin: '30px auto',
        }}
      >
        <div>
          <label htmlFor="region">Région :</label>
          <Select
            id="region"
            showSearch
            style={{ width: '250px', marginLeft: '1rem' }}
            value={region}
            onChange={selectRegionValue}
          >
            <Select.Option value=""></Select.Option>
            {allRegions.map((reg) => (
              <Select.Option key={reg} value={reg}>
                {reg}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="department">Département :</label>
          <Select
            id="department"
            showSearch
            style={{ width: '250px', marginLeft: '1rem' }}
            value={department}
            onChange={selectDepartmentValue}
          >
            <Select.Option value=""></Select.Option>
            {departmentsToDisplay.map((dep) => (
              <Select.Option key={dep} value={dep}>
                {dep}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="agency">Agence :</label>
          <Select
            id="agency"
            showSearch
            style={{ width: '250px', marginLeft: '1rem' }}
            value={agency}
            onChange={selectAgencyValue}
          >
            <Select.Option value=""></Select.Option>
            {agenciesToDisplay.map((dep) => (
              <Select.Option key={dep} value={dep}>
                {dep}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="start-period">Actualisation :</label>
          <Select
            id="start-period"
            style={{ width: '150px', marginLeft: '2rem' }}
            value={period}
            onChange={setPeriod}
          >
            {declarationsMonth.map((month) => (
              <Select.Option key={month.id} value={month.id}>
                {moment(month.month).format('MMM YYYY')}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      {agency && declarationMonth && (
        <RepartitionAgency
          usersInAgency={usersGlobalRepartition.agencies[agencyCode]}
          declarationMonth={declarationMonth}
          agencyCode={agencyCode}
        />
      )}

      {!agency && declarationMonth && (
        <RepartitionRegionDepartment
          usersGlobalRepartition={usersGlobalRepartition}
          region={region}
          department={department}
          declarationMonth={declarationMonth}
          selectRegion={selectRegionValue}
          selectDepartment={selectDepartmentValue}
          selectAgency={selectAgencyValue}
        />
      )}
    </div>
  )
}

export default RepartitionForm
