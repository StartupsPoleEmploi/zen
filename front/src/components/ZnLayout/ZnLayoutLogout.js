import React from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'
import Link from '@material-ui/core/Link'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import AccountIcon from '@material-ui/icons/AccountCircleOutlined'

import AppTitle from '../Generic/AppTitle'
import { secondaryBlue } from '../../constants'

import logoPEMono from '../../images/logoPE-mono.png'

const windowWidthElement = {
  width: '100vw',
  left: '50%',
  marginLeft: ' -50vw',
  position: 'relative',
}
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
    position: 'absolute',
    right: '0',
    top: '0',
    display: 'flex',

    width: '32rem',
    maxWidth: '100%',
    minHeight: '5rem',
    margin: '0',
    borderRadius: '0 0 0 10rem',
    paddingLeft: '4rem',
    paddingRight: '4rem',
    lineHeight: '3rem',
  },
  footer: {
    display: 'flex',
    minHeight: '15rem',
    backgroundColor: `${secondaryBlue}`,
    textAlign: 'center',
    ...windowWidthElement,
  },
}))

export default function ZnLayoutLogout({ children }) {
  const classes = useStyles()
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

      <footer className={classes.footer} role="contentinfo">
        <Grid container justify="space-between" alignItems="center">
          <Grid item xs={2}>
            <Link
              href="cgu"
              style={{ color: '#fff', textDecoration: 'underline' }}
            >
              <Typography>CGU</Typography>
            </Link>
          </Grid>
          <Grid item xs={8}>
            <div style={{ textAlign: 'center' }}>
              <AppTitle zenColor="#fff" />
              <br />
              <Typography
                variant="caption"
                // 0.51 (not 0.5) is the accessibility threshold for our background color
                style={{ color: '#fff', opacity: 0.51, letterSpacing: 1.5 }}
              >
                Un service propulsé par Pôle emploi
              </Typography>
            </div>
          </Grid>
          <Grid item xs={2} />
        </Grid>
      </footer>
    </div>
  )
}

ZnLayoutLogout.propTypes = {
  children: PropTypes.node,
}
