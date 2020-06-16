import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import logo from '../../images/logoFull.svg';
import MainActionButton from './MainActionButton';
import CustomDialog from './CustomDialog';

const useStyles = makeStyles((theme) => ({
  modal: {
    backgroundColor: 'rgba(0, 101, 219, 0.5)',
  },
  paper: {
    padding: theme.spacing(3, 0),
  },
  titleImg: {
    height: '6rem',
    width: 'auto',
    [theme.breakpoints.down('xs')]: {
      width: '86%',
      height: 'auto',
    },
  },
  content: {
    margin: theme.spacing(1, 0),
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.5rem',
    },
  },
  button: {
    textTransform: 'uppercase',
    [theme.breakpoints.down('xs')]: {
      height: '5.5rem !important',
      fontSize: '1.4rem',
    },
  },
}));

export default function CookiePolicy() {
  const classes = useStyles();
  const [consent, setConsent] = useState(
    localStorage.getItem('cookieConsent') === 'true' ||
      process.env.REACT_APP_ZEN_ENV === 'test',
  );
  const setCookieConsent = () => {
    localStorage.setItem('cookieConsent', 'true');
    setConsent('true');
  };

  return (
    <CustomDialog
      disablePortal
      disableAutoFocus
      width="xl"
      titleId="CookiePolicyContainer"
      isOpened={!consent}
      className={classes.modal}
      paperProps={{ className: classes.paper }}
      title={
        <img src={logo} alt="Zen - Pôle emploi" className={classes.titleImg} />
      }
      content={(
        <Typography className={classes.content} align="center">
          En poursuivant votre navigation sur ce site, vous acceptez
          l'utilisation de cookies pour améliorer la qualité du service et pour
          réaliser des statistiques de visite.
        </Typography>
      )}
      actions={(
        <MainActionButton
          onClick={setCookieConsent}
          title="J'accepte"
          className={classes.button}
          primary
        >
          J'accepte
        </MainActionButton>
      )}
    />
  );
}
