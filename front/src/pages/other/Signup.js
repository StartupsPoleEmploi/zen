import Typography from '@material-ui/core/Typography'
import React from 'react'
import styled from 'styled-components'

const StyledSignup = styled.div`
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 48rem;
`

const LandingText = styled(Typography).attrs({
  variant: 'title',
  paragraph: true,
})``

export const Signup = () => (
  <StyledSignup>
    <LandingText>Inscription terminée</LandingText>

    <Typography paragraph>Votre inscription à Zen est terminée.</Typography>
    <Typography paragraph>
      Nous vous contacterons prochainement pour un prochain test.
    </Typography>
    <Typography paragraph>
      Si vous souhaitez contacter l'équipe, vous pouvez envoyer un message à{' '}
      <a href="mailto:zen@pole-emploi.fr">zen@pole-emploi.fr</a>
    </Typography>
    <Typography paragraph>Merci de l'intérêt que vous portez à Zen.</Typography>
  </StyledSignup>
)

export default Signup
