import React from 'react';
import styled from 'styled-components';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import PropTypes from 'prop-types';

import MainActionButton from './MainActionButton';

const StyledArrowForwardIcon = styled(ArrowForwardIcon)`
  && {
    margin-left: 1rem;
  }
`;
const ContainerBt = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-around;
  align-items: center;
`;

export default function MainBt({ children, style = {}, ...props }) {
  return (
    <MainActionButton
      style={{ ...style }}
      primary
      {...props}
    >
      <ContainerBt>
        <div />
        <>{children}</>
        <StyledArrowForwardIcon />
      </ContainerBt>
    </MainActionButton>
  );
}

MainBt.propTypes = {
  children: PropTypes.node,
  style: PropTypes.shape({}),
};
