import {
  FilteringState,
  EditingState,
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
  TableEditColumn,
} from '@devexpress/dx-react-grid-material-ui'
import Paper from '@material-ui/core/Paper'
import { format } from 'date-fns'
import PropTypes from 'prop-types'
import React, { useState, Fragment } from 'react'

import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import WarningIcon from '@material-ui/icons/Warning'
import { Typography } from '@material-ui/core'

export const UsersTable = ({
  allowSelection,
  users,
  selectedUsersIds,
  setSelectedUsersIds,
  deleteUser,
}) => {
  const [userToDelete, setUserToDelete] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(null)

  const rows = users.map((user) => ({
    ...user,
    isAuthorized: user.isAuthorized ? 'oui' : 'non',
    createdAt: format(user.createdAt, 'DD/MM/YYYY'),
  }))

  const cancelDeleteUser = () => {
    setUserToDelete(null)
    setShowDeleteModal(false)
  }

  const doDeleteUser = () => {
    setShowDeleteModal(false)
    deleteUser(userToDelete)
  }

  const commitChanges = ({ deleted }) => {
    if (deleted) {
      const userId = deleted[0]
      setUserToDelete(userId)
      setShowDeleteModal(true)
    }
  }

  return (
    <Fragment>
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
            {},
          ]}
          getRowId={(row) => row.id}
        >
          <FilteringState />
          <EditingState onCommitChanges={commitChanges} />
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
          <TableEditColumn
            showDeleteCommand
            messages={{ deleteCommand: 'Supprimer' }}
          />

          {allowSelection && <TableSelection selectByRowClick highlightRow />}

          <PagingPanel pageSizes={[10, 50, 100]} />
        </Grid>
      </Paper>

      <Dialog
        open={showDeleteModal}
        onClose={cancelDeleteUser}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Supprimer définitivement ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography color="error">
              <WarningIcon
                style={{
                  marginRight: '1rem',
                  maxWidth: '50%',
                  verticalAlign: 'bottom',
                }}
              />
              Cette action est irréversible !
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteUser} color="primary">
            Non, j'annule
          </Button>
          <Button onClick={doDeleteUser} color="primary">
            Oui, je confirme
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
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
  deleteUser: PropTypes.func.isRequired,
  selectedUsersIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  setSelectedUsersIds: PropTypes.func.isRequired,
}

export default UsersTable
