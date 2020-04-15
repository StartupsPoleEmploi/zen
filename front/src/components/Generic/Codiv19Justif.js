
import React from 'react'
import styled from 'styled-components'
import { Typography } from '@material-ui/core'
import PropTypes from 'prop-types'

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
function Codiv19Justif({ whiteBg = false }) {
  if (!window.location.pathname.startsWith('/files')) {
    return null;
  }

  return (
    <Container whiteBg={whiteBg}>
      <div>
        <ExclamationMark aria-hidden="true">!</ExclamationMark>
      </div>
      <Text>
        <Title>
          Justificatif <span style={{ color: errorOrange }} >COVID-19</span>
        </Title>
        <Typography>
          Pour donner votre attestation d'activité partielle :
          <ul>
            <li>
              Se connecter à votre espace personnel
              {' '}
              <a href="https://www.pole-emploi.fr" target="_blank" rel="noopener noreferrer"> pole-emploi.fr</a>
              {' '}
              et envoyer l'attestation activité partielle dfans la cotégorie Bullettin de salaire.
            </li> 
          </ul>
        </Typography>
      </Text>
    </Container>
  )
}

Codiv19Justif.propTypes = {
  whiteBg: PropTypes.bool,
}

export default Codiv19Justif

