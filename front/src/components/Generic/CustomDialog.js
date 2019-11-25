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
    display: flex;
    flex-direction: column;
    text-align: center;
  }
`

const StyledDialogTitle = styled(DialogTitle)`
  text-align: center;
`

const StyledDialogActions = styled(DialogActions)`
  && {
    justify-content: space-around;
    flex-wrap: wrap;
  }
`

/*
 * This base Dialog structure is used for most of the dialogs of the app
 * It includes thresholds with media queries to switch to full screen
 * and reusable structure. Modify with care.
 */
export const CustomDialog = ({
  actions,
  content,
  header,
  titleId,
  title,
  isOpened,
  onCancel,
  width,
  forceConstantHeight,
  paperProps,
  ...rest
}) => {
  const useMobileStyling = width === muiBreakpoints.xs

  return (
    <Dialog
      open={isOpened}
      onClose={onCancel}
      aria-labelledby={titleId}
      fullScreen={useMobileStyling}
      PaperProps={{
        style: {
          height: forceConstantHeight && !useMobileStyling ? '90vh' : '',
        },
        ...paperProps,
      }}
      {...rest}
    >
      {title && <StyledDialogTitle id={titleId}>{title}</StyledDialogTitle>}
      {header}
      {content && (
        <StyledDialogContent
          style={{
            padding: useMobileStyling ? '1rem' : '',
          }}
        >
          {content}
        </StyledDialogContent>
      )}
      {actions && (
        <StyledDialogActions
          style={{ paddingBottom: useMobileStyling ? 0 : '2rem' }}
        >
          {actions}
        </StyledDialogActions>
      )}
    </Dialog>
  )
}

CustomDialog.propTypes = {
  actions: PropTypes.node,
  content: PropTypes.node,
  header: PropTypes.node,
  onCancel: PropTypes.func,
  isOpened: PropTypes.bool.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  titleId: PropTypes.string,
  forceConstantHeight: PropTypes.bool,
  width: PropTypes.string,
  paperProps: PropTypes.shape(),
}

CustomDialog.defaultProps = {
  onCancel: () => {},
  paperProps: {},
}

export default withWidth()(CustomDialog)
