import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const StyledDialogContent = styled(DialogContent)`
  && {
    text-align: center;
  }
`

const StyledDialogTitle = styled(DialogTitle)`
  text-align: center;
`

const StyledDialogActions = styled(DialogActions)`
  && {
    justify-content: space-around;
    padding-bottom: 2rem;
  }
`

export const CustomDialog = ({
  actions,
  content,
  titleId,
  title,
  isOpened,
  onCancel,
  ...rest
}) => (
  <Dialog
    open={isOpened}
    onClose={onCancel}
    aria-labelledby={titleId}
    {...rest}
  >
    <StyledDialogTitle id={titleId}>{title}</StyledDialogTitle>
    <StyledDialogContent>{content}</StyledDialogContent>
    {actions && <StyledDialogActions>{actions}</StyledDialogActions>}
  </Dialog>
)

CustomDialog.propTypes = {
  actions: PropTypes.node,
  content: PropTypes.node.isRequired,
  onCancel: PropTypes.func,
  isOpened: PropTypes.bool.isRequired,
  title: PropTypes.string,
  titleId: PropTypes.string,
}

CustomDialog.defaultProps = {
  onCancel: () => {},
}

export default CustomDialog
