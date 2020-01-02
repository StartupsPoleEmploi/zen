import React, { useState, useEffect } from 'react';
import superagent from 'superagent';
import { Switch, Form } from 'antd';


import ZnContent from '../../components/ZnContent';
import ZnHeader from '../../components/ZnHeader';


export default function Settings() {
  const [isActivated, setIsActivated] = useState(null);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    superagent.get('/api/status').then(({ body }) => setIsActivated(body.up));
  }, []);

  useEffect(() => {
    if (!isModified) return;

    superagent
      .post('/zen-admin-api/status', { up: isActivated })
      .then(({ body }) => setIsActivated(body.up));
  }, [isActivated, isModified]);

  const onChange = () => {
    setIsModified(true);
    setIsActivated(!isActivated);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <ZnHeader title="Système" />

      <ZnContent>
        <b>
          {`Cette page permet d'afficher la modale de désactivation d'urgence de
          Zen, bloquant le service. Ne pas manipuler sans raison !`}
        </b>
        {isActivated !== null && (
          <div>
            <Form.Item label={isActivated ? 'Zen est Activé' : <b>Zen est désactivé</b>}>
              <Switch defaultChecked onChange={onChange} />
            </Form.Item>
          </div>
        )}
      </ZnContent>
    </div>
  );
}
