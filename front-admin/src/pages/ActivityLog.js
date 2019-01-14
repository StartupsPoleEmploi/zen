import {
  FilteringState,
  IntegratedFiltering,
  IntegratedPaging,
  IntegratedSorting,
  PagingState,
  RowDetailState,
  SortingState,
} from '@devexpress/dx-react-grid'
import {
  Grid,
  PagingPanel,
  Table,
  TableFilterRow,
  TableHeaderRow,
} from '@devexpress/dx-react-grid-material-ui'
import Paper from '@material-ui/core/Paper'
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'
import superagent from 'superagent'

const actionsLabels = {
  VALIDATE_DECLARATION: `Étape 1 (déclaration initiale) terminée`,
  VALIDATE_EMPLOYERS: `Étape 2 (employeurs, salaires et heures travaillée) terminée`,
  VALIDATE_FILES: `Étape 3 (envoi des fichiers) terminée`,
  TRANSMIT_FILE: `Fichier transmis sur pole-emploi.fr`,
  TRANSMIT_DECLARATION: `Déclaration transmise sur pole-emploi.fr`,
}

export const ActivityLog = () => {
  const [activityLog, setActivityLog] = useState(null)

  useEffect(() => {
    superagent.get(`/zen-admin-api/activityLog`).then(({ body }) => {
      setActivityLog(body)
    })
  }, [])

  if (!activityLog) return null

  const rows = activityLog.map((log) => ({
    ...log,
    name: `${log.user.firstName} ${log.user.lastName}`,
    declarationId: log.metadata.declarationId,
    action: actionsLabels[log.action],
    createdAt: format(log.createdAt, 'YYYY-MM-DD HH:mm:ss'),
  }))

  return (
    <Paper>
      <Grid
        rows={rows}
        columns={[
          { name: 'name', title: 'Nom' },
          { name: 'action', title: 'Action' },
          { name: 'declarationId', title: 'id de déclaration' },
          { name: 'createdAt', title: 'Date' },
        ]}
      >
        <FilteringState />
        <SortingState
          defaultSorting={[{ columnName: 'createdAt', direction: 'desc' }]}
        />
        <RowDetailState />
        <PagingState defaultPageSize={100} />

        <IntegratedFiltering />
        <IntegratedSorting />
        <IntegratedPaging />
        <IntegratedSorting />
        <Table />
        <TableHeaderRow showSortingControls />
        <TableFilterRow showFilterSelector />

        <PagingPanel pageSizes={[100, 500, 1000]} />
      </Grid>
    </Paper>
  )
}

ActivityLog.propTypes = {}

export default ActivityLog
