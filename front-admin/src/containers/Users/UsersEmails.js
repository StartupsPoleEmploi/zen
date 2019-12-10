import React, { useState } from 'react';
import { Button, Input } from 'antd';
import superagent from 'superagent';

const { TextArea } = Input;

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export default function UsersEmails() {
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState('');
  const [emailsToCheck, setEmailsToCheck] = useState([]);
  const [errors, setErrors] = useState([]);

  const getEmailsArray = (string) => string
    .split('\n')
    .map((email) => email.trim())
    .filter((email) => email.match(EMAIL_REGEX));

  const authorizeUsersbByEmails = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Autoriser ces utilisateurs ?')) return;

    let addedUsersNb = 0;
    const newErrors = [];
    const newEmailsToCheck = [];

    const allEmailsArray = getEmailsArray(emails);

    setLoading(true);

    while (allEmailsArray.length) {
      const emailsChunk = allEmailsArray.splice(0, 50);
      // eslint-disable-next-line no-await-in-loop
      await superagent
        .post('/zen-admin-api/users/authorize', { emails: emailsChunk })
        // eslint-disable-next-line no-loop-func
        .then(({ body: { updatedRowsNb } }) => { addedUsersNb += updatedRowsNb; })
        .catch((err) => {
          newErrors.push(err);
          newEmailsToCheck.push(...emailsChunk);
        });
    }

    setLoading(false);
    setEmailsToCheck(newEmailsToCheck);
    setErrors(newErrors);

    // eslint-disable-next-line no-alert
    let msgAlert = `${addedUsersNb} utilisateurs ont été ajoutés.`;
    if (newErrors.length) { msgAlert += 'Il y a eu des erreurs, merci d\'en donner le détail aux développeurs'; }

    // eslint-disable-next-line no-alert
    window.alert(msgAlert);
  };

  if (loading) {
    return <div style={{ textAlign: 'center' }}>Chargement…</div>;
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Ajout d'utilisateurs par e-mail</h1>
      <div style={{ margin: 'auto', width: '30rem' }}>
        <div>
          <h2>
            {getEmailsArray(emails).length}
            {' '}
e-mails détectés
          </h2>
          <TextArea
            rows="15"
            placeholder="Copier ici des e-mails"
            onChange={(e) => setEmails(e.target.value)}
            value={emails}
          />
        </div>
        <Button
          onClick={authorizeUsersbByEmails}
          variant="outlined"
          style={{ marginBottom: '1rem' }}
        >
          Autoriser les nouveaux utilisateurs
        </Button>
      </div>
      <div>
        {errors.map((error) => (
          <p style={{ color: 'red' }}>
            <b>{error.message}</b>
          </p>
        ))}
        {emailsToCheck.length > 0 && (
          <p style={{ fontWeight: 'bold' }}>
            Vérifier ces e-mails manuellement :
          </p>
        )}
        <ul style={{ listStyle: 'none' }}>
          {emailsToCheck.map((email) => (
            <li>{email}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
