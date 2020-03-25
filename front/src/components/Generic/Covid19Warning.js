import React from 'react'
import styled from 'styled-components'
import { Typography } from '@material-ui/core'
import PropTypes from 'prop-types'

import MainActionButton from './MainActionButton'
import { errorOrange, intermediaryBreakpoint } from '../../constants'

const Container = styled.div`
  width: 100%;
  max-width: 1100px;
  display: grid;
  grid-template-columns: 5px 1fr 230px;
  grid-column-gap: 2rem;
  grid-row-gap: 1rem;
  padding: 1.5rem;
  border: solid 1px ${errorOrange};
  margin: 0 auto 3rem auto;
  background: ${({ whiteBg }) => (whiteBg ? 'white' : null)};

  @media (max-width: ${intermediaryBreakpoint}) {
    grid-template-columns: 5px 1fr;
  }
`

const ExclamationMark = styled.div`
  color: ${errorOrange};
  font-weight: bolder;
  font-size: 2.5rem;
  position: relative;
  top: -3px;
`
const Title = styled.h2`
  text-transform: uppercase;
  margin: 0;
  font-size: 2rem;
`

const Text = styled.div`
  display: flex;
  flex-direction: column;
`

const ButtonContainer = styled.div`
  align-self: center;
  @media (max-width: ${intermediaryBreakpoint}) {
    grid-column: 2/2;
  }
`

const MoreInfoButton = styled(MainActionButton)`
  && {
    width: 100%;
    letter-spacing: 1px;
    font-weight: bold;
    height: 6rem;
    margin: 0;

    @media (max-width: ${intermediaryBreakpoint}) {
      width: 230px;
    }
  }
`

function Covid19Warning({ whiteBg = false }) {
  return (
    <Container whiteBg={whiteBg}>
      <div>
        <ExclamationMark aria-hidden="true">!</ExclamationMark>
      </div>
      <Text>
        <Title>
          Informations situation{' '}
          <span style={{ color: errorOrange }}>Covid-19</span>
        </Title>
        <Typography>
          L'Equipe Zen répond à vos questions sur l'actualisation pendant cette
          situation exceptionnelle.
        </Typography>
      </Text>
      <ButtonContainer>
        <MoreInfoButton
          href="https://pole-emploi.zendesk.com/hc/fr/sections/360003786219-Crise-sanitaire-COVID-19"
          rel="noopener"
          target="_blank"
          primary
          title="En savoir plus concernant le dispostif Covid-19 (nouvelle fenêtre)"
        >
          Plus d'informations
        </MoreInfoButton>
      </ButtonContainer>
    </Container>
  )
}

Covid19Warning.propTypes = {
  whiteBg: PropTypes.bool,
}

export default Covid19Warning
