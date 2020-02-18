import React from 'react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import styled from 'styled-components'
import SentimentVeryDissatisfiedIcon from '@material-ui/icons/SentimentVeryDissatisfied'

const StyledNotAutorized = styled.div`
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 50rem;
`

const LandingText = styled(Typography).attrs({
  variant: 'h6',
  paragraph: true,
})``

const StyleSeparator = styled.div`
  background-color: #0065db;
  border-radius: 2px;
  width: 4.5rem;
  height: 0.6rem;
`

export default function NotAutorized({ showIcon = true }) {
  return (
    <StyledNotAutorized>
      {showIcon && (
        <SentimentVeryDissatisfiedIcon
          style={{ fontSize: 84 }}
          color="secondary"
        />
      )}
      <LandingText component="h1" style={{ marginBottom: '5rem' }}>
        Malheureusement, vous n'êtes pas autorisé à utiliser Zen.
      </LandingText>

      <Typography paragraph style={{ marginBottom: '5rem' }}>
        <strong>
          <span aria-label="Seuls">Seul.e.s</span> les{' '}
          <span aria-label="assistants ou assistantes maternels">
            assistant.e.s maternel.le.s
          </span>
          <br />
          (hormis les régions suivantes : Bourgogne-Franche-Comté, Centre Val de
          Loire et les DOM TOM) sont{' '}
          <span aria-label="autorisés">autorisé.e.s.</span>
        </strong>
      </Typography>

      <Typography paragraph variant="subtitle1">
        Si vous pensez tout de même être éligible pour utiliser Zen.
        <br />
        Merci de nous contacter par e-mail{' '}
        <a href="mailto:zen.00322@pole-emploi.fr">zen.00322@pole-emploi.fr</a>
      </Typography>

      <StyleSeparator />
    </StyledNotAutorized>
  )
}

NotAutorized.propTypes = {
  showIcon: PropTypes.bool,
}
