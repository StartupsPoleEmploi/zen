import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import withWidth from '@material-ui/core/withWidth';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import { muiBreakpoints } from '../../constants';

const StyledDialogContent = styled(DialogContent)`
  && {
    display: flex;
    flex-direction: column;
    text-align: center;
    flex: inherit;
  }
`;

const StyledTitleIcon = styled.div`
  margin-top: 3rem;
  margin-bottom: 0;
  text-align: center;
  svg {
    font-size: 4rem;
  }
`;

const StyledDialogTitle = styled(DialogTitle)`
  && {
    margin-top: ${({ hasIcon }) => (hasIcon ? '0' : '3rem')};
    font-size: 2.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-align: center;

    h2 {
      font-weight: bold;
    }
  }
`;

const StyledDialogActions = styled(DialogActions)`
  && {
    justify-content: space-around;
    flex-wrap: wrap;
  }
`;

// eslint-disable-next-line react/prop-types
function CloseButton({ onClose }) {
  return (
    <IconButton onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
      <CloseIcon />
    </IconButton>
  );
}

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
  titleIcon,
  isOpened,
  onCancel,
  width,
  forceConstantHeight,
  paperProps,
  displayCancel,
  ...rest
}) => {
  const useMobileStyling = width === muiBreakpoints.xs;

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
      {titleIcon && <StyledTitleIcon>{titleIcon}</StyledTitleIcon>}
      {title && (
        <StyledDialogTitle hasIcon={titleIcon} id={titleId}>
          <>
            {title}
            {onCancel && displayCancel &&
              <CloseButton onClose={onCancel} />}
          </>
        </StyledDialogTitle>
      )}
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
  );
};

CustomDialog.propTypes = {
  actions: PropTypes.node,
  content: PropTypes.node,
  header: PropTypes.node,
  onCancel: PropTypes.func,
  isOpened: PropTypes.bool.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  titleIcon: PropTypes.node,
  titleId: PropTypes.string,
  forceConstantHeight: PropTypes.bool,
  width: PropTypes.string,
  paperProps: PropTypes.shape(),
  displayCancel: PropTypes.bool,
};

CustomDialog.defaultProps = {
  onCancel: () => {},
  paperProps: {},
};

export default withWidth()(CustomDialog);
