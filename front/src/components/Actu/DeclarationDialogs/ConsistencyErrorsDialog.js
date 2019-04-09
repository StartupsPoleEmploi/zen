import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import DialogContentText from '@material-ui/core/DialogContentText'

import CustomColorButton from '../../Generic/CustomColorButton'
import CustomDialog from '../../Generic/CustomDialog'

const ConsistencyErrorsDialogs = ({
  consistencyErrors,
  onCancel,
  confirmAndIgnoreErrors,
  defaultProps,
}) => {
  return (
    <CustomDialog
      content={
        <Fragment>
          <DialogContentText>
            Notre système a détecté de possibles incohérences dans votre
            actualisation{' '}:
          </DialogContentText>
          <ul style={{ padding: 0 }}>
            <Fragment>
              {consistencyErrors.map((error) => (
                <DialogContentText component="li" key={error}>
                  {error}
                </DialogContentText>
              ))}
            </Fragment>
          </ul>
          <DialogContentText>
            Confirmez-vous ces informations ?
          </DialogContentText>
        </Fragment>
      }
      actions={
        <Fragment>
          <CustomColorButton onClick={onCancel}>
            Je modifie ma déclaration
          </CustomColorButton>
          <Button
            variant="contained"
            onClick={confirmAndIgnoreErrors}
            color="primary"
            autoFocus
          >
            Je valide cette déclaration
          </Button>
        </Fragment>
      }
      {...defaultProps}
    />
  )
}

ConsistencyErrorsDialogs.propTypes = {
  onCancel: PropTypes.func.isRequired,
  confirmAndIgnoreErrors: PropTypes.func.isRequired,
  consistencyErrors: PropTypes.arrayOf(PropTypes.string).isRequired,
  defaultProps: PropTypes.object.isRequired,
}

export default ConsistencyErrorsDialogs
