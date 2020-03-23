import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';

import useMediaQuery from '@material-ui/core/useMediaQuery';

import ZnNavLogin from './ZnNavLogin';
import { mobileBreakpoint } from '../../../constants';
import { isNavigationVisible } from './routes';
import dashboardBg from '../../../images/dashboard-bg.svg';
import SuccessSnackBar from '../../Generic/SuccessSnackBar';
import ZnLayoutHeader from './ZnLayoutHeader';
import Covid19Warning from '../../Generic/Covid19Warning';

const StyledLayout = styled.div`
  margin: auto;
`;

const CovidContainer = styled.div`
  padding: 0 15% 1rem 15%;
  @media (max-width: 1400px) {
    padding: 0 5% 1rem 5%;
  }
`;

const Main = styled.main.attrs({ role: 'main' })`
  padding: 7rem 1rem;
  flex-grow: 1;
  overflow: hidden;

  background: ${({ addBackground }) =>
    (addBackground ? `url(${dashboardBg}) no-repeat 0 100%` : null)};

  @media (max-height: 1000px) {
    background: none;
  }
  @media (max-width: 672px) {
    background: none;
  }

  @media (max-width: ${mobileBreakpoint}) {
    padding-top: 2rem;
  }
`;

export const Layout = ({
  activeMonth,
  activeDeclaration,
  isFilesServiceUp,
  children,
  user,
  location: { pathname },
  history: { push },
}) => {
  const [copySnack, setCopySnack] = React.useState(0);
  const isNavVisible = isNavigationVisible(pathname);

  const useMobileVersion = useMediaQuery(`(max-width:${mobileBreakpoint})`);

  const NavComponent = () => (
    <ZnNavLogin
      user={user}
      isFilesServiceUp={isFilesServiceUp}
      history={{ push }}
      location={{ pathname }}
      activeMonth={activeMonth}
      activeDeclaration={activeDeclaration}
    />
  );

  return (
    <StyledLayout>
      {useMobileVersion && isNavVisible && NavComponent()}
      <div style={{ display: 'flex', width: '100vw' }}>
        {!useMobileVersion && isNavVisible && NavComponent()}
        <div style={{ width: '100vw' }}>
          <ZnLayoutHeader
            useMobileVersion={useMobileVersion}
            user={user}
          />
          <Main addBackground={false}>
            <CovidContainer>
              <Covid19Warning />
            </CovidContainer>
            {children}
          </Main>
        </div>
      </div>
      {copySnack !== 0 && (
      <SuccessSnackBar
        message="Copié"
        onHide={() => setCopySnack(0)}
      />
      )}
    </StyledLayout>
  );
};

Layout.propTypes = {
  children: PropTypes.node,
  user: PropTypes.shape({
    firstName: PropTypes.string,
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }).isRequired,
  isFilesServiceUp: PropTypes.bool.isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired })
    .isRequired,
  activeMonth: PropTypes.instanceOf(Date),
  activeDeclaration: PropTypes.object,
};

export default withRouter(Layout);
