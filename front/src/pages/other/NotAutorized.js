import React from 'react';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';

const StyledNotAutorized = styled.div`
  margin: auto;
  max-width: 90rem;
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
        vous n'êtes pas autorisé.e à utiliser Zen.
      </LandingText>

      <Text paragraph style={{ marginBottom: '5rem' }}>
        {' '}
        Nous vous invitons à utiliser le service d’actualisation mis à disposition sur
        {' '}
        <a href="https://www.pole-emploi.fr/accueil/" target="_blank" rel="noopener noreferrer"> www.pole-emploi.fr</a>
        {' '}
      </Text>

      <Text paragraph variant="subtitle1">
        {' '}
        Pour plus d’informations, vous pouvez consulter l’article
        {' '}
        <a href="https://zen.pole-emploi.fr/zen-doc/?p=278" target="_blank" rel="noopener noreferrer"> « Pourquoi je n’ai pas/plus accès à ZEN »</a>
      </Text>
    </StyledNotAutorized>
  );
}

NotAutorized.propTypes = {
};
