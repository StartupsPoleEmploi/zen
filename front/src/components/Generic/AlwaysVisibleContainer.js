import Paper from '@material-ui/core/Paper'
import { throttle } from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'
import withWidth from '@material-ui/core/withWidth'
import ScrollToButton from './ScrollToButton'

const padding = 20 // Padding to compensate for when switching to position fixed

const ScrollButtonContainer = styled.div`
  position: relative;
`

export class AlwaysVisibleContainer extends Component {
  static propTypes = {
    children: PropTypes.node,
    scrollButtonTopValue: PropTypes.string,
    width: PropTypes.string.isRequired,
  }

  state = {
    usePositionFixed: false,
  }

  offsetHeight = 0 // eslint-disable-line react/sort-comp

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
    if (this.props.width === 'xs') {
      this.setState({
        usePositionFixed: false,
      })
      return
    }

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
    const { scrollButtonTopValue } = this.props

    const Comp = usePositionFixed ? Paper : 'div'
    return (
      <div ref={this.setRef} {...this.props}>
        {usePositionFixed && (
          /* Placeholder for lost height when element goes fixed */
          <div
            style={{
              visibility: 'hidden',
              minHeight: this.props.width === 'xs' ? null : this.offsetHeight,
            }}
          />
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
          {usePositionFixed && (
            <ScrollButtonContainer>
              <ScrollToButton top={scrollButtonTopValue} />
            </ScrollButtonContainer>
          )}
          {this.props.children}
        </Comp>
      </div>
    )
  }
}

export default withWidth()(AlwaysVisibleContainer)
