import React from 'react';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';

const StyledNotAutorized = styled.div`
  margin: auto;
  max-width: 85rem;
  padding: 5rem 0 10rem 0;
`;

const LandingText = styled(Typography).attrs({
  variant: 'h4',
  paragraph: true,
})`
  text-transform: uppercase;
`;

const Text = styled(Typography)`
  && { 
    font-size: 2rem;
  }
`;

export default function NotAutorized() {
  return (
    <StyledNotAutorized>
      <LandingText component="h1" style={{ marginBottom: '5rem' }}>
        Malheureusement, vous n'êtes pas autorisé.e à utiliser Zen.
      </LandingText>

      <Text paragraph style={{ marginBottom: '5rem' }}>
        <span aria-label="Seul">Seul.e</span>
        {' '}
        un.e
        {' '}
        <span aria-label="assistant ou assistante maternel">
          assistant.e maternel.le
        </span>
        {' '}
        <span aria-label="inscrit ou inscrite">inscrit.e</span>
        {' '}
        à Pôle emploi exerçant une activité en France (excepté en Bourgogne-France-Comté,
        Centre Val de Loire et les DOM TOM), est autorisé.e à utiliser ZEN.
      </Text>

      <Text paragraph variant="subtitle1">
        Si vous pensez être éligible pour utiliser Zen,
        merci de nous contacter via
        {' '}
        notre formulaire de contact,
        {' '}
        <a href="https://zen.pole-emploi.fr/zen-doc/?p=336"> en cliquant ici.</a>
      </Text>
    </StyledNotAutorized>
  );
}

NotAutorized.propTypes = {
};
