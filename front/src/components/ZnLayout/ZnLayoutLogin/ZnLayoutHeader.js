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
import SettingsIcon from '@material-ui/icons/Settings';

import { Box } from '@material-ui/core';
import AppTitle from '../../Generic/AppTitle';
import {
  secondaryBlue, errorOrange, mobileBreakpoint, primaryBlue,
} from '../../../constants';

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

function ZnLayoutHeader({ user, useMobileVersion }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [copySnack, setCopySnack] = React.useState(0);
  const [anchorElInvitation, setAnchorElInvitation] = React.useState(null);
  const [anchorElProfile, setAnchorElProfile] = React.useState(null);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleClickInvitation = (event) => setAnchorElInvitation(event.currentTarget);
  const handleCloseInvitation = () => setAnchorElInvitation(null);
  const handleClickProfile = (event) => setAnchorElProfile(event.currentTarget);
  const handleCloseProfile = () => setAnchorElProfile(null);
  const isCopy = () => {
    copy('https://zen.pole-emploi.fr/');
    handleCloseInvitation();
    setCopySnack(copySnack + 1);
  };

  const openMail = Boolean(anchorEl);
  const openInvitation = Boolean(anchorElInvitation);
  const openProfile = Boolean(anchorElProfile);
  const idMail = openMail ? 'simple-popover' : undefined;

  return (
    <Header>
      <HeaderElem logo>
        <AppTitle />
      </HeaderElem>
      <HeaderElem first>
        <ButtonMail aria-describedby="invitation-popover" onClick={handleClickInvitation}>
          {!useMobileVersion && (<TagTypo>NOUVEAU</TagTypo>)}
          <PersonAddOutlinedIcon style={{ color: primaryBlue }} />
          {!useMobileVersion && (
          <Typography>
            Inviter vos contacts sur Zen
          </Typography>
          )}
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
          <PopoverLine onClick={isCopy}>
            <LinkOutlinedIcon style={{ color: primaryBlue }} />
            <Typography>
              Copier le lien
            </Typography>
          </PopoverLine>
        </Popover>
      </HeaderElem>
      <HeaderElem first>
        <Button aria-describedby="invitation-popover" onClick={handleClickProfile}>
          <AccountCircleOutlinedIcon />
          {!useMobileVersion && (
          <Typography>
            {user.firstName}
          </Typography>
          )}
        </Button>

        <Popover
          id="profile-popover"
          open={openProfile}
          anchorEl={anchorElProfile}
          onClose={handleCloseProfile}
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
            <a href={`/email-subscribing/${user.peId}`}>
              <SettingsIcon style={{ color: primaryBlue }} />
              <Typography>
                Gestion e-mails reçus
              </Typography>
            </a>
          </PopoverLine>
        </Popover>
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
  );
}

ZnLayoutHeader.propTypes = {
  user: PropTypes.shape({
    firstName: PropTypes.string,
    peId: PropTypes.string,
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired })
    .isRequired,
  useMobileVersion: PropTypes.bool.isRequired,
};

export default withRouter(ZnLayoutHeader);
