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
        Malheureusement, vous n'êtes pas autorisé à utiliser Zen.
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
        à Pôle emploi exerçant une activité en France est autorisé à utiliser Zen,
        {' '}
        excepté en Bourgogne-Franche-Comté, Centre Val de
        Loire et les DOM TOM.
      </Text>

      <Text paragraph variant="subtitle1">
        Si vous pensez être éligible pour utiliser Zen,
        merci de nous contacter par
        {' '}
        <a href="mailto:zen.00322@pole-emploi.fr">par e-mail</a>
        .
      </Text>
    </StyledNotAutorized>
  );
}

NotAutorized.propTypes = {
};
