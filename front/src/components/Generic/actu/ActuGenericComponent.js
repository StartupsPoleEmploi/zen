import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';

// -------------- ActuStatusBlock --------------
const Container = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
`;
const ContainerIcon = styled.div`
  margin-right: 1rem;
  display: inline-block;
  vertical-align: bottom;
`;
export function ActuStatusBlock({ title, Icon, children }) {
  return (
    <Container>
      <ContainerIcon>
        {Icon}
      </ContainerIcon>
      <div>
        <Typography
          className="declaration-status"
          style={{ textTransform: 'uppercase', marginBottom: '1rem' }}
        >
          <strong>{title}</strong>
        </Typography>

        {children}
      </div>
    </Container>
  );
}
ActuStatusBlock.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string.isRequired,
  Icon: PropTypes.node.isRequired,
};

// -------------- ActuHr --------------
export function ActuHr() {
  return (
    <div style={{ margin: '0rem -2rem', backgroundColor: '#fff', height: '0.5rem' }} />
  );
}
