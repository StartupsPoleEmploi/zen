import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import PropTypes from 'prop-types'
import { throttle } from 'lodash'

import { primaryBlue } from '../../constants'

const ScrollButton = styled.button`
  position: absolute;
  right: 0;

  width: 45px;
  height: 45px;

  display: flex;
  align-self: center;
  justify-content: center;
  padding: 1rem;

  border-radius: 50%;
  background-color: ${primaryBlue};
  border: none;

  cursor: pointer;
`

const ScrollImg = styled(ArrowDownwardIcon)`
  color: white;
`

function ScrollToButton({ top = '-2rem', autoRemove = false }) {
  const [visible, setVisible] = useState(
    autoRemove ? window.scrollY < window.outerHeight : true,
  )

  function handleEvent() {
    setVisible(window.scrollY < window.outerHeight)
  }
  const throttleHandleEvent = throttle(handleEvent, 100)

  useEffect(() => {
    if (autoRemove) {
      window.addEventListener('scroll', throttleHandleEvent)
      window.addEventListener('resize', throttleHandleEvent)
    }

    return () => {
      if (autoRemove) {
        window.removeEventListener('scroll', throttleHandleEvent)
        window.removeEventListener('resize', throttleHandleEvent)
      }
    }
  }, [])

  function scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight)
  }

  if (!visible) return null
  return (
    <ScrollButton type="button" onClick={scrollToBottom} style={{ top }}>
      <ScrollImg alt="Se rendre en bas de de la page" />
    </ScrollButton>
  )
}

ScrollToButton.propTypes = {
  top: PropTypes.string,
  autoRemove: PropTypes.bool,
}

export default ScrollToButton
