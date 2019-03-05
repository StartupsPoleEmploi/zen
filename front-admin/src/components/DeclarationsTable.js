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
  TableRowDetail,
} from '@devexpress/dx-react-grid-material-ui'
import Paper from '@material-ui/core/Paper'
import React from 'react'
import PropTypes from 'prop-types'
import { format } from 'date-fns'

import DeclarationsTableDetailRow from './DeclarationsTableDetailRow'

export const DeclarationsTable = ({ declarations }) => {
  const rows = declarations.map((declaration) => ({
    ...declaration,
    name: `${declaration.user.firstName} ${declaration.user.lastName}`,
    email: declaration.user.email,
    status: declaration.hasFinishedDeclaringEmployers
      ? declaration.isFinished
        ? 'Actu et documents envoyés'
        : 'Actu envoyée'
      : 'Actu non terminée',
    transmittedAt:
      declaration.transmittedAt &&
      format(declaration.transmittedAt, 'DD/MM/YYYY'),
    verified:
      declaration.review && declaration.review.isVerified ? 'oui' : 'non',
    notes: (declaration.review && declaration.review.notes) || '',
  }))
  return (
    <Paper>
      <Grid
        rows={rows}
        columns={[
          { name: 'name', title: 'Nom' },
          { name: 'email', title: 'E-mail' },
          { name: 'status', title: 'Statut' },
          { name: 'verified', title: 'Vérifié' },
          { name: 'transmittedAt', title: 'Transmis le' },
          { name: 'notes', title: 'Notes' },
        ]}
        getRowId={(row) => row.id}
      >
        <FilteringState />
        <SortingState
          defaultSorting={[{ columnName: 'name', direction: 'asc' }]}
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
        <TableRowDetail contentComponent={DeclarationsTableDetailRow} />

        <PagingPanel pageSizes={[100, 500, 1000]} />
      </Grid>
    </Paper>
  )
}

DeclarationsTable.propTypes = {
  declarations: PropTypes.arrayOf(
    PropTypes.shape({
      user: PropTypes.shape({
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
        email: PropTypes.string,
      }),
      hasFinishedDeclaringEmployers: PropTypes.bool.isRequired,
      isFinished: PropTypes.bool.isRequired,
      employers: PropTypes.array,
    }),
  ),
}

export default DeclarationsTable
