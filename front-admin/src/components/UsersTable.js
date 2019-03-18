import {
  FilteringState,
  IntegratedFiltering,
  IntegratedPaging,
  IntegratedSorting,
  PagingState,
  RowDetailState,
  SelectionState,
  SortingState,
} from '@devexpress/dx-react-grid'
import {
  Grid,
  PagingPanel,
  Table,
  TableFilterRow,
  TableHeaderRow,
  TableSelection,
} from '@devexpress/dx-react-grid-material-ui'
import Paper from '@material-ui/core/Paper'
import { format } from 'date-fns'
import PropTypes from 'prop-types'
import React from 'react'

export const UsersTable = ({
  allowSelection,
  users,
  selectedUsersIds,
  setSelectedUsersIds,
}) => {
  const rows = users.map((user) => ({
    ...user,
    isAuthorized: user.isAuthorized ? 'oui' : 'non',
    createdAt: format(user.createdAt, 'DD/MM/YYYY'),
  }))

  return (
    <Paper>
      <Grid
        rows={rows}
        columns={[
          { name: 'firstName', title: 'Prénom' },
          { name: 'lastName', title: 'Nom' },
          { name: 'email', title: 'E-mail' },
          { name: 'postalCode', title: 'Code postal' },
          { name: 'isAuthorized', title: 'Autorisé' },
          { name: 'createdAt', title: 'Inscrit le' },
        ]}
        getRowId={(row) => row.id}
      >
        <FilteringState />
        <SortingState
          defaultSorting={[{ columnName: 'lastName', direction: 'asc' }]}
        />
        <RowDetailState />
        <PagingState defaultPageSize={10} />

        <IntegratedFiltering />
        <IntegratedSorting />
        <IntegratedPaging />
        <IntegratedSorting />

        {allowSelection && (
          <SelectionState
            selection={selectedUsersIds}
            onSelectionChange={setSelectedUsersIds}
          />
        )}

        <Table />
        <TableHeaderRow showSortingControls />
        <TableFilterRow showFilterSelector />

        {allowSelection && <TableSelection selectByRowClick highlightRow />}

        <PagingPanel pageSizes={[10, 50, 100]} />
      </Grid>
    </Paper>
  )
}

UsersTable.propTypes = {
  allowSelection: PropTypes.bool.isRequired,
  users: PropTypes.arrayOf(
    PropTypes.shape({
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      email: PropTypes.string,
    }),
  ),
  selectedUsersIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  setSelectedUsersIds: PropTypes.func.isRequired,
}

export default UsersTable
