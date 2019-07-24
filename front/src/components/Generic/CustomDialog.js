import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import withWidth from '@material-ui/core/withWidth'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import { muiBreakpoints } from '../../constants'

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
  width,
  ...rest
}) => (
  <Dialog
    open={isOpened}
    onClose={onCancel}
    aria-labelledby={titleId}
    fullScreen={width === muiBreakpoints.xs}
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
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  titleId: PropTypes.string,
  width: PropTypes.string,
}

CustomDialog.defaultProps = {
  onCancel: () => {},
}

export default withWidth()(CustomDialog)
