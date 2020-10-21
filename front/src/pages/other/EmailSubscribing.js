import React, { useEffect } from 'react';
import superagent from 'superagent';
import { useParams } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';

import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Snackbar from '@material-ui/core/Snackbar';
import styled from 'styled-components';

import { H2 } from '../../components/Generic/Titles';
import catchMaintenance from '../../lib/catchMaintenance';

const StyledEmailSubscribing = styled.div`
  margin: auto;
  max-width: 85rem;
  padding: 5rem 0 10rem 0;
  minHeight: '50vh',
`;

export default function EmailSubscribing() {
  const { peId } = useParams();
  const [loading, setLoading] = React.useState(true);
  const [peIdValide, setPeIdValide] = React.useState(true);
  const [checked, setChecked] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    setLoading(true);
    superagent
      .get(`/api/user/subscribe-email-info/${peId}`)
      .then(({ body: { isSubscribedEmail } }) => setChecked(isSubscribedEmail))
      .catch(catchMaintenance)
      .catch(() => setPeIdValide(false))
      .finally(() => setLoading(false));
  }, [peId]);

  const toggleChecked = () => {
    superagent
      .patch(`/api/user/subscribe-email/${peId}`, { isSubscribedEmail: !checked })
      .then(() => {
        setChecked(!checked);
        setOpen(true);
      })
      .catch(catchMaintenance);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
      }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (!peIdValide) {
    return (
      <StyledEmailSubscribing>
        <H2>Votre lien est invalide :-/</H2>
      </StyledEmailSubscribing>
    );
  }

  return (
    <StyledEmailSubscribing>
      <H2>Gestion des e-mails reçus</H2>

      <FormGroup>
        <FormControlLabel
          control={<Switch checked={checked} onChange={toggleChecked} />}
          label="Souhaitez-vous recevoir des e-mails de la part de ZEN ?"
        />
      </FormGroup>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={open}
        autoHideDuration={1500}
        onClose={handleClose}
        message="Votre modification a bien été prise en compte"
      />
    </StyledEmailSubscribing>
  );
}

EmailSubscribing.propTypes = {
};
