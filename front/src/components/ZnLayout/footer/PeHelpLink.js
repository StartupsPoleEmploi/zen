import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import styled from 'styled-components';
import superagent from 'superagent';

import {
  DialogContentText,
  FormControl,
  TextField,
  FormHelperText,
  Typography,
} from '@material-ui/core';
import ChevronRight from '@material-ui/icons/ChevronRight';

import MainActionButton from '../../Generic/MainActionButton';
import { mobileBreakpoint, errorRed } from '../../../constants';
import { CustomDialog } from '../../Generic/CustomDialog';

const Li = styled.li`
  padding: 1.5rem 0;
  @media (max-width: ${mobileBreakpoint}) {
    border-bottom: solid 1px #344370;
    padding: 2rem 0;
  }
`;

const StyledButton = styled.button`
  && {
    color: #fff;
    text-decoration: none;
    display: flex;
    cursor: pointer;
    background: none;
    border: none;
    text-align: left;
    padding: 0;
    width: 100%;
    &:hover { text-decoration: underline; }
    p { flex: 1; }
    span { witdh: 5rem; }
    @media (max-width: ${mobileBreakpoint}) {
      width: 90%;
      margin: auto;
    }
  }
`;

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function PeHelpLink() {
  const [showProLink, setShowProLink] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showEmailError, setShowEmailError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (process.env.REACT_APP_ENABLED_HELP_PE_STAFF === 'true') {
        const { body } = await superagent.get('/api/user/is-pro');
        setShowProLink(body.status === 'Authorized');
      }
    }
    if (!showProLink) {
      fetchData();
    }
  }, [showProLink, setShowProLink]);

  // Modal
  function closeModal() {
    setShowEmailModal(false);
  }
  function validateForm() {
    if (!email || !EMAIL_REGEX.test(email) || !email.endsWith('@pole-emploi.fr')) {
      setShowEmailError(true);
      return false;
    }

    closeModal();
    setShowEmailError(false);
    window.open('https://zen.pole-emploi.fr/zen-doc/?page_id=476');
    superagent.post('/api/user/save-email', { email }).catch(() => {});
    return true;
  }
  function showModal() {
    if (!validateForm()) {
      setShowEmailError(false);
      setShowEmailModal(true);
    }
  }

  if (!showProLink) return null;

  return (
    <>
      {ReactDOM.createPortal(
        <CustomDialog
          content={(
            <>
              <DialogContentText>
                Pour continuer, veuillez entrer votre adresse e-mail Pôle emploi :
              </DialogContentText>
              <DialogContentText>
                <FormControl style={{ width: '100%' }}>
                  <TextField
                    id="email"
                    label="E-mail"
                    onChange={(e) => setEmail(e.target.value)}
                    error={showEmailError}
                  />
                  {showEmailError && (
                    <FormHelperText style={{ color: errorRed, textAlign: 'center' }}>
                      Veuillez réessayer ou prendre contact avec :
                      <br />
                      <br />
                      sylvie.lebel@pole-emploi.fr
                      <br />
                      ou
                      <br />
                      s.vandenbergue@pole-emploi.fr
                    </FormHelperText>
                  )}
                </FormControl>
              </DialogContentText>
            </>
          )}
          title="Accès FAQ - Conseiller Pôle emploi"
          titleId="pe-mail-modal"
          isOpened={showEmailModal}
          onCancel={closeModal}
          actions={(
            <>
              <MainActionButton primary={false} onClick={closeModal}>
                Annuler
              </MainActionButton>
              <MainActionButton color="primary" onClick={validateForm}>
                Valider
              </MainActionButton>
            </>
          )}
        />,
        document.body,
      )}

      <Li>
        <StyledButton onClick={showModal}>
          <Typography>Aide en ligne - Conseiller Pôle emploi</Typography>
          <span style={{ textAlign: 'right' }}>
            <ChevronRight />
          </span>
        </StyledButton>
      </Li>
    </>
  );
}

export default React.memo((props) => <PeHelpLink {...props} />);
