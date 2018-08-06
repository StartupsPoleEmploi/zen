import { withStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'

const styles = (theme) => ({
  arrowPopper: {
    opacity: 1,

    '&[x-placement*="bottom"] $arrowArrow': {
      top: 0,
      left: 0,
      marginTop: '-0.9em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '0 1em 1em 1em',
        borderColor: `transparent transparent ${
          theme.palette.grey[700]
        } transparent`,
      },
    },
    '&[x-placement*="top"] $arrowArrow': {
      bottom: 0,
      left: 0,
      marginBottom: '-0.9em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '1em 1em 0 1em',
        borderColor: `${
          theme.palette.grey[700]
        } transparent transparent transparent`,
      },
    },
    '&[x-placement*="right"] $arrowArrow': {
      left: 0,
      marginLeft: '-0.9em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 1em 1em 0',
        borderColor: `transparent ${
          theme.palette.grey[700]
        } transparent transparent`,
      },
    },
    '&[x-placement*="left"] $arrowArrow': {
      right: 0,
      marginRight: '-0.9em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 0 1em 1em',
        borderColor: `transparent transparent transparent ${
          theme.palette.grey[700]
        }`,
      },
    },
  },
  arrowArrow: {
    position: 'absolute',
    fontSize: 7,
    width: '3em',
    height: '3em',
    '&::before': {
      content: '""',
      margin: 'auto',
      display: 'block',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    },
  },
})

class TootlipOnFocus extends Component {
  state = {
    arrowRef: null,
  }

  static propTypes = {
    children: PropTypes.node,
    classes: PropTypes.object,
    content: PropTypes.node,
  }

  handleArrowRef = (arrowRef) =>
    this.setState({
      arrowRef,
    })

  render() {
    const { children, classes, content } = this.props

    return (
      <Tooltip
        disableHoverListener
        disableTouchListener
        placement="top"
        ref={this.handleArrowRef}
        title={
          <Fragment>
            {content}
            <span className={classes.arrowArrow} ref={this.handleArrowRef} />
          </Fragment>
        }
        classes={{ popper: classes.arrowPopper, tooltip: classes.tooltip }}
        PopperProps={{
          popperOptions: {
            modifiers: {
              arrow: {
                enabled: Boolean(this.state.arrowRef),
                element: this.state.arrowRef,
              },
            },
          },
        }}
      >
        {children}
      </Tooltip>
    )
  }
}

export default withStyles(styles)(TootlipOnFocus)
