import Button from '@material-ui/core/Button'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import { primaryBlue } from '../../constants/colors'

const StyledButton = styled(Button).attrs({
  role: 'link', // remove after https://github.com/mui-org/material-ui/issues/15512 merge
  href: 'https://pole-emploi.zendesk.com',
  target: '_blank',
  variant: 'outlined',
  rel: 'noopener noreferrer',
})`
  && {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 3rem;
  }
`

const WhiteButton = styled(StyledButton)`
  && {
    background-color: #fff;
    color: #000;
    float: right;

    &:hover {
      background-color: #fff;
      color: #000;
    }
  }
`

const BlueButton = styled(StyledButton).attrs({
  variant: 'contained',
  color: 'primary',
})`
  color: black;
`

const FaqLink = ({ useWhiteVersion = false }) => {
  const Comp = useWhiteVersion ? WhiteButton : BlueButton

  const questionColor = useWhiteVersion ? primaryBlue : '#fff'

  return (
    <Comp>
      Des questions&nbsp;?
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: questionColor,
          border: `1px solid ${questionColor}`,
          borderRadius: '50%',
          height: '1.8rem',
          width: '1.8rem',
          marginLeft: '1rem',
        }}
      >
        ?
      </div>
    </Comp>
  )
}

FaqLink.propTypes = {
  useWhiteVersion: PropTypes.bool,
}

export default FaqLink
