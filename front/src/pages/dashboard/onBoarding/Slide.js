import React from 'react'
import styled from 'styled-components'
import Check from '@material-ui/icons/Check'
import PropTypes from 'prop-types'
import { Typography } from '@material-ui/core'

import { H2 } from '../../../components/Generic/Titles'
import {
  intermediaryBreakpoint,
  primaryBlue,
  mobileBreakpoint,
} from '../../../constants'
import arrow from '../../../images/onBoarding/arrow.svg'

const Left = styled.div`
  padding: 2rem;
  text-align: center;
  @media (max-width: ${mobileBreakpoint}) {
    padding: 0;
  }
`
const Right = styled.div`
  display: flex;
  @media (max-width: ${intermediaryBreakpoint}) {
    margin-bottom: 2rem;
  }
`

const Li = styled.div`
  margin-top: 2.5rem;
`

const BlueBadge = styled.div`
  background: ${primaryBlue};
  width: 3rem;
  height: 3rem;
  justify-content: center;
  border-radius: 50%;
  color: white;
  font-weight: bold;
  font-size: 2rem;
  display: flex;
  align-items: center;
  margin-right: 1rem;
`

const SmallGreenCheckIcon = styled(Check)`
  && {
    color: green;
    font-size: 2rem;
    margin-right: 1rem;
    padding-top: 2px;
  }
`

const Ul = styled.div`
  margin: 0;
`

const Figure = styled.figure`
  margin: 0;
`

const SlideContainer = styled.div`
  display: flex;
  padding: 5rem;
  min-height: 45rem;
  align-items: center;
  border-bottom: solid 1px lightgray;

  @media (max-width: 1000px) {
    padding: 5rem 2rem;
  }

  @media (max-width: ${intermediaryBreakpoint}) {
    flex-direction: column-reverse;
    padding: 5rem 4rem;
  }

  @media (max-width: ${mobileBreakpoint}) {
    padding: 5rem 2rem;
  }
`

function Slide({
  leftText,
  img,
  badgeNumber,
  h2Content,
  arrowStyle,
  list = [],
}) {
  return (
    <SlideContainer>
      <Left>
        {leftText ? (
          <>
            <Figure>
              <img src={img} alt="" />
              <Typography
                component="figcaption"
                style={{ position: 'relative' }}
              >
                {arrowStyle && <img src={arrow} style={arrowStyle} alt="" />}
                {leftText}
              </Typography>
            </Figure>
          </>
        ) : (
          <img src={img} alt="" />
        )}
      </Left>
      <Right>
        {badgeNumber && (
          <div>
            <BlueBadge>{badgeNumber}</BlueBadge>
          </div>
        )}
        <div>
          <H2
            style={{
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontSize: '2.5rem',
              lineHeight: '3rem',
            }}
          >
            {h2Content}{' '}
          </H2>

          <Ul>
            {list.map((content, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Li key={index}>
                <Typography style={{ display: 'flex' }}>
                  <SmallGreenCheckIcon />
                  <span>{content}</span>
                </Typography>
              </Li>
            ))}
          </Ul>
        </div>
      </Right>
    </SlideContainer>
  )
}

Slide.propTypes = {
  img: PropTypes.string.isRequired,
  leftText: PropTypes.string,
  badgeNumber: PropTypes.string,
  h2Content: PropTypes.object.isRequired,
  arrowStyle: PropTypes.object.isRequired,
  list: PropTypes.array.isRequired,
}

export default Slide
