import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { openHelpPopup } from '../../redux/actions/helpPopup';

const A = styled.a`
    color: -webkit-link;
    cursor: pointer;
    text-decoration: underline;    
    `;

function HelpLinkHome({ onClick }) {
  return (
    <span>
      «&nbsp;
      <A
        onClick={onClick}
        title="Consulter notre page d'aide"
        style={{ color: 'white' }}
      >
        Foire aux Questions
      </A>
      &nbsp;»
    </span>
  );
}

HelpLinkHome.propTypes = {
  onClick: PropTypes.func,
};

export default connect(
  (state) => ({
    isOpened: state.helpPopup.isOpen,
  }),
  {
    onClick: openHelpPopup,
  },
)(HelpLinkHome);
