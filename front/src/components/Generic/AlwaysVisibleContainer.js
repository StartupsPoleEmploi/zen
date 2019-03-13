import Paper from '@material-ui/core/Paper'
import { throttle } from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

const padding = 20 // Padding to compensate for when switching to position fixed

export class AlwaysVisibleContainer extends Component {
  static propTypes = {
    children: PropTypes.node,
  }

  state = {
    usePositionFixed: false,
  }

  offsetHeight = 0

  componentDidMount() {
    this.scrollListener = throttle(this.handleEvent, 100)
    this.resizeListener = throttle(this.handleEvent, 100)
    window.addEventListener('scroll', this.scrollListener)
    window.addEventListener('resize', this.resizeListener)

    this.handleEvent()
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.scrollListener)
    window.removeEventListener('resize', this.resizeListener)
  }

  handleEvent = () => {
    if (!this.ref) return
    // offsetHeight = 0 when position absolute, so we save the biggest offsetHeight we get
    if (
      this.ref.offsetHeight !== this.offsetHeight &&
      this.ref.offsetHeight !== 0
    ) {
      this.offsetHeight = this.ref.offsetHeight
    }

    this.setState({
      usePositionFixed:
        this.ref.offsetTop + this.offsetHeight + padding >
        window.scrollY + window.innerHeight,
    })
  }

  setRef = (ref) => {
    this.ref = ref
  }

  render() {
    const { usePositionFixed } = this.state

    const Comp = usePositionFixed ? Paper : 'div'
    return (
      <div ref={this.setRef} {...this.props}>
        {usePositionFixed && (
          /* Placeholder for lost height when element goes fixed */
          <div style={{ visibility: 'hidden', minHeight: this.offsetHeight }} />
        )}
        <Comp
          style={{
            position: usePositionFixed ? 'fixed' : 'static',
            bottom: 0,
            left: 0,
            right: 0,
            padding: usePositionFixed ? '2rem' : '0',
            background: usePositionFixed ? '#fff' : 'inherit',
          }}
        >
          {this.props.children}
        </Comp>
      </div>
    )
  }
}

export default AlwaysVisibleContainer
