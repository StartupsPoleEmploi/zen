import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import AccountIcon from '@material-ui/icons/AccountCircleOutlined';

import HelpLink from './HelpLink';
import AppTitle from '../Generic/AppTitle';

import logoPEMono from '../../images/logoPE-mono.png';
import Footer from './footer/Footer';

const windowWidthElement = {
  width: '100vw',
  left: '50%',
  marginLeft: ' -50vw',
  position: 'relative',
};
const useStyles = makeStyles((theme) => ({
  header: {
    backgroundColor: '#f3f4f5',
    padding: '5rem 10rem 4rem',
    [theme.breakpoints.down('sm')]: {
      padding: '5rem 0 3rem',
    },
    ...windowWidthElement,
  },
  headerContent: {
    maxWidth: '144rem',
    display: 'flex',
    alignItems: 'flex-end',
    margin: 'auto',
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: '2rem',
    },
    [theme.breakpoints.down('xs')]: {
      paddingTop: '3.5rem',
    },
  },
  headerConnectButton: {
    position: 'fixed',
    right: '0',
    top: '0',
    display: 'flex',
    textTransform: 'uppercase',
    zIndex: 2,

    width: '36rem',
    maxWidth: '100%',
    minHeight: '5rem',
    margin: '0',
    borderRadius: '0 0 0 10rem',
    paddingLeft: '4rem',
    paddingRight: '4rem',
    lineHeight: '3rem',
  },
}));

export default function ZnLayoutLogout({ children }) {
  const classes = useStyles();
  return (
    <div>
      <header className={classes.header} role="banner">
        <div className={classes.headerContent}>
          <AppTitle />
          <img
            src={logoPEMono}
            alt="logo Pôle emploi"
            style={{
              height: '3.5rem',
              width: 'auto',
              display: 'block',
            }}
          />
        </div>
        <Button
          className={classes.headerConnectButton}
          color="primary"
          variant="contained"
          href="/api/login"
          role="link"
        >
          <AccountIcon style={{ width: '4rem' }} />
          <Typography style={{ color: 'white', paddingLeft: '0.5rem' }}>
            Se connecter avec mes identifiants Pôle emploi
          </Typography>
        </Button>
      </header>

      <main style={{ overflow: 'hidden' }} role="main">
        {children}
      </main>

      <Footer />

      <HelpLink />
    </div>
  );
}

ZnLayoutLogout.propTypes = {
  children: PropTypes.node,
};
