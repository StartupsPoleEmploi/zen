import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'

import { helpColor } from '../../constants'

const styles = () => ({
  tooltip: {
    background: 'white',
    color: 'black',
    border: `solid 2px ${helpColor}`,
    borderRadius: 0,
    padding: '2rem 1.5rem',
    boxShadow: '5px 5px 20px grey',
  },
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
        borderColor: `transparent transparent ${helpColor} transparent`,
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
        borderColor: `${helpColor} transparent transparent transparent`,
      },
    },
    '&[x-placement*="right"] $arrowArrow': {
      left: 0,
      marginLeft: '-0.9em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 1em 1em 0',
        borderColor: `transparent ${helpColor} transparent transparent`,
      },
    },
    '&[x-placement*="left"] $arrowArrow': {
      right: 0,
      marginRight: '-0.9em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 0 1em 1em',
        borderColor: `transparent transparent transparent ${helpColor}`,
      },
    },
  },
  arrowArrow: {
    position: 'absolute',
    fontSize: 7,
    width: '3em',
    height: '3em',
    '&::before': {
      position: 'relative',
      bottom: '1px',
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
  static propTypes = {
    children: PropTypes.node,
    classes: PropTypes.object,
    content: PropTypes.node,
    tooltipId: PropTypes.string,
    useHover: PropTypes.bool,
  }

  static defaultProps = {
    useHover: false,
  }

  state = {
    arrowRef: null,
  }

  handleArrowRef = (arrowRef) =>
    this.setState({
      arrowRef,
    })

  render() {
    const { children, classes, content, tooltipId, useHover } = this.props

    const eventProps = {
      disableHoverListener: !useHover,
      disableTouchListener: true,
      disableFocusListener: useHover,
    }

    return (
      <Tooltip
        id={tooltipId}
        {...eventProps}
        placement="bottom"
        ref={this.handleArrowRef}
        aria-hidden="false"
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
