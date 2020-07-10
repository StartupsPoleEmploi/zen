import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import copy from 'copy-to-clipboard';

import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import PersonAddOutlinedIcon from '@material-ui/icons/PersonAddOutlined';
import EmailOutlinedIcon from '@material-ui/icons/EmailOutlined';
import LinkOutlinedIcon from '@material-ui/icons/LinkOutlined';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import PriorityHighIcon from '@material-ui/icons/PriorityHigh';

import useMediaQuery from '@material-ui/core/useMediaQuery';

import { Box } from '@material-ui/core';
import AppTitle from '../Generic/AppTitle';
import ZnNavLogin from './ZnNavLogin';
import {
  secondaryBlue, errorOrange, mobileBreakpoint, primaryBlue,
} from '../../constants';
import dashboardBg from '../../images/dashboard-bg.svg';
import Covid19Warning from '../Generic/Covid19Warning';
import Codiv19Justif from '../Generic/Codiv19Justif';

const routesWithDisplayedNav = [
  '/actu',
  '/employers',
  '/files',
  '/dashboard',
  '/thanks',
  '/history',
  '/cgu',
];

const StyledLayout = styled.div`
  margin: auto;
`;

const Header = styled.header.attrs({ role: 'banner' })`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 8.3rem;
  width: 100%;
  border-bottom: 1px #ddd solid;

  @media (max-width: ${mobileBreakpoint}) {
    justify-content: space-between;
  }
`;

const ButtonMail = styled(Button)`
  .MuiButton-label {
    width: auto;
  }
`;

const PopoverMailContainer = styled(Typography)`
  && {
    display: flex;
    align-items: start;
    width: 33rem;
    margin: 2rem;
  }
`;

const HeaderElem = styled.div`
  display: ${({ logo }) => (logo ? 'none' : 'flex')};
  align-items: center;
  margin-left: ${({ first }) => (first ? '1rem' : '0')};
  padding-left: ${({ first }) => (first ? '3rem' : '1.5rem')};
  padding-right: ${({ end }) => (end ? '3rem' : '1.5rem')};
  height: 100%;
  border-left: ${({ first }) => (first ? '1px solid #ddd' : 'none')};
  
  .logo {
    display: none;
  }

  svg {
    color: ${secondaryBlue};
    margin-right: ${({ first, end }) => (first || end ? '0.8rem' : 'auto')};
  }

  @media (max-width: ${mobileBreakpoint}) {
    display: flex;
    padding-left: ${({ first }) => (first ? '1rem' : '1rem')};
    padding-right: ${({ end }) => (end ? '1rem' : '0rem')};
    .logout-text {
      display: none;
    }
  }
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

const PopoverLine = styled(Box)`
  margin: 2rem; 
  display: flex;
  cursor: pointer;

  svg {
    margin-right: 1rem;
  }

  a {
    display: flex;
    text-decoration: none;
    color: black;
  }

  &:hover {
    text-decoration: underline;
    color: ${primaryBlue};

    a {
      color: ${primaryBlue};
    }
  }
`;

const TagTypo = styled(Typography)`
  && {
    color: white;
    background-color: ${primaryBlue};
    position: absolute;
    right: 0;
    font-size: 9px;
    font-weight: bold;
    padding: 4px 8px;
    letter-spacing: 2px;
    top: -16px;
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
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorElInvitation, setAnchorElInvitation] = React.useState(null);
  const isNavVisible = routesWithDisplayedNav.includes(pathname);

  const useMobileVersion = useMediaQuery(`(max-width:${mobileBreakpoint})`);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleClickInvitation = (event) => setAnchorElInvitation(event.currentTarget);
  const handleCloseInvitation = () => setAnchorElInvitation(null);

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

  const openMail = Boolean(anchorEl);
  const openInvitation = Boolean(anchorElInvitation);
  const idMail = openMail ? 'simple-popover' : undefined;

  return (
    <StyledLayout>
      {useMobileVersion && isNavVisible && NavComponent()}
      <div style={{ display: 'flex', width: '100vw' }}>
        {!useMobileVersion && isNavVisible && NavComponent()}
        <div style={{ width: '100vw' }}>
          <Header>
            <HeaderElem logo>
              <AppTitle />
            </HeaderElem>
            <HeaderElem first>
              <ButtonMail aria-describedby="invitation-popover" onClick={handleClickInvitation}>
                <TagTypo>NOUVEAU</TagTypo>
                <PersonAddOutlinedIcon style={{ color: primaryBlue }} />
                <Typography>
                  Inviter vos contacts sur Zen
                </Typography>
              </ButtonMail>
              <Popover
                id="invitation-popover"
                open={openInvitation}
                anchorEl={anchorElInvitation}
                onClose={handleCloseInvitation}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <PopoverLine>
                  <a href="mailto:?subject=Découvrez ZEN pôle emploi, le service d'actualisation adapté aux assistantes maternelles&body=https://zen.pole-emploi.fr/">
                    <EmailOutlinedIcon style={{ color: primaryBlue }} />
                    <Typography>
                      Envoyer par mail
                    </Typography>
                  </a>
                </PopoverLine>
                <PopoverLine onClick={() => copy('https://zen.pole-emploi.fr/')}>
                  <LinkOutlinedIcon style={{ color: primaryBlue }} />
                  <Typography>
                    Copier le lien
                  </Typography>
                </PopoverLine>
              </Popover>
            </HeaderElem>
            <HeaderElem first>
              <AccountCircleOutlinedIcon />
              <Typography>
                {user.firstName}
              </Typography>
            </HeaderElem>
            <HeaderElem>
              <ButtonMail aria-describedby={idMail} onClick={handleClick}>
                <MailOutlineIcon />
              </ButtonMail>
              <Popover
                id={idMail}
                open={openMail}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <PopoverMailContainer>
                  <PriorityHighIcon style={{ marginRight: '2rem', fontSize: '4rem', color: errorOrange }} />
                  <Typography>
                    N'oubliez pas de consulter régulièrement vos courriers en ligne sur votre
                    {' '}
                    <a href="https://www.pole-emploi.fr" target="_blank" rel="noopener noreferrer">espace personnel</a>
                    {' '}
                    pôle emploi.
                  </Typography>
                </PopoverMailContainer>
              </Popover>
            </HeaderElem>
            <HeaderElem end>
              <Button
                href="/api/login/logout"
                target="_self"
                disableRipple
                variant="text"
                style={{ padding: '0px 0.5rem', margin: '0', height: '4rem' }}
              >
                <ExitToAppIcon />
                <Typography className="logout-text">
                  Se déconnecter
                </Typography>
              </Button>
            </HeaderElem>
          </Header>
          <Main addBackground={false}>
            <CovidContainer>
              <Covid19Warning />
              <Codiv19Justif />
            </CovidContainer>
            {children}
          </Main>
        </div>
      </div>
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
