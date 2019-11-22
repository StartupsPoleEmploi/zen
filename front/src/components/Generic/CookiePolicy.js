import React, { useState } from 'react'
import Modal from '@material-ui/core/Modal'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

import logo from '../../images/logoFull.svg'
import MainActionButton from './MainActionButton'

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    padding: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 101, 219, 0.5)',
  },
  paper: {
    width: 500,
    backgroundColor: theme.palette.background.paper,
    borderRadius: '0.5rem',
    padding: theme.spacing(6, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    marginBottom: '3rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    height: '5.5rem',
    width: 'auto',
    display: 'block',
  },
  button: {
    marginTop: '3rem !important',
    fontSize: '1.6rem',
  },
}))

export default function CookiePolicy() {
  const classes = useStyles()
  const [consent, setConsent] = useState(
    localStorage.getItem('cookieConsent') === 'true' &&
      process.env.REACT_APP_ZEN_ENV !== 'test',
  )
  const setCookieConsent = () => {
    localStorage.setItem('cookieConsent', 'true')
    setConsent('true')
  }

  return (
    <Modal
      disablePortal
      disableEnforceFocus
      disableAutoFocus
      open={!consent}
      aria-labelledby="server-modal-title"
      aria-describedby="server-modal-description"
      className={classes.modal}
    >
      <div className={classes.paper}>
        <Typography align="center" className={classes.header}>
          <img src={logo} alt="Pole emploi" className={classes.img} />
        </Typography>

        <Typography align="center">
          En poursuivant votre navigation sur ce site, vous acceptez
          l'utilisation de cookies pour améliorer la qualité du service et pour
          réaliser des statistiques de visite.
        </Typography>

        <MainActionButton
          onClick={setCookieConsent}
          title="Je m'actualise"
          className={classes.button}
          primary
        >
          J'ACCEPTE
        </MainActionButton>
      </div>
    </Modal>
  )
}
