import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import blueIcon from './PEConnectIcon-blue.svg';
import whiteIcon from './PEConnectIcon-white.svg';

const BLUE = '#1b2e57';
const WHITE = '#fff';

/*
 * Style adapted from
 * https://www.emploi-store-dev.fr/portail-developpeur-cms/home/catalogue-des-api/documentation-des-api/utiliser-les-api/authorization-code-flow/bouton-de-connexion.html
 */

const StyledA = styled.a`
  font-size: 14px;
  font-family: 'Lato', sans-serif !important;
  display: inline-block;
  padding: 6px 10px 5px 13px;
  border-radius: 100px;
  border: 2px ${BLUE} solid;
  font-weight: bold;
  text-decoration: none;
  white-space: nowrap;

  color: ${(props) => (props.useDarkVersion ? WHITE : BLUE)};
  background-color: ${(props) => (props.useDarkVersion ? BLUE : WHITE)};

  &:hover,
  &:focus {
    text-decoration: none;
  }

  &:hover {
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
  }

  &:focus {
    opacity: 0.7;
  }
`;

const PEConnectIcon = styled.img`
  display: inline-block;
  vertical-align: middle;
`;

const PEConnectText = styled.span`
  vertical-align: middle;
  padding: 0 10px;
  margin-top: 6px;
`;

export const PEConnectLink = ({ useDarkVersion = false }) => (
  <StyledA href="/api/login" useDarkVersion={useDarkVersion}>
    <PEConnectIcon
      src={useDarkVersion ? whiteIcon : blueIcon}
      alt=""
      width="34"
      height="31"
    />
    <PEConnectText>Se connecter avec Pôle emploi</PEConnectText>
  </StyledA>
);

PEConnectLink.propTypes = {
  useDarkVersion: PropTypes.bool,
};

export default PEConnectLink;
