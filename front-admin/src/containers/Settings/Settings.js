import React, { useState, useEffect } from 'react';
import superagent from 'superagent';
import { Switch, Form } from 'antd';

import ZnContent from '../../components/ZnContent';
import ZnHeader from '../../components/ZnHeader';

export default function Settings() {
  const [isGlobalActivated, setIsGlobalActivated] = useState(null);
  const [isFilesActivated, setIsFilesActivated] = useState(null);

  useEffect(() => {
    superagent.get('/api/status').then(({ body }) => {
      setIsGlobalActivated(body.global.up);
      setIsFilesActivated(body.files.up);
    });
  }, []);

  const updateGlobalStatus = () => {
    superagent
      .post('/zen-admin-api/status-global', { up: !isGlobalActivated })
      .then(({ body }) => setIsGlobalActivated(body.up));
  };

  const updateFilesStatus = () => {
    superagent
      .post('/zen-admin-api/status-files', { up: !isFilesActivated })
      .then(({ body }) => setIsFilesActivated(body.isFilesServiceUp));
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <ZnHeader title="Système" />

      <ZnContent>
        <b>
          Cet interrupteur permet d'afficher la modale globale de désactivation
          d'urgence de Zen, bloquant le service. Ne pas manipuler sans raison !
        </b>
        {isGlobalActivated !== null && (
          <div>
            <Form.Item
              label={
                isGlobalActivated ? 'Zen est Activé' : <b>Zen est désactivé</b>
              }
            >
              <Switch
                checked={isGlobalActivated}
                onChange={updateGlobalStatus}
              />
            </Form.Item>
          </div>
        )}
      </ZnContent>

      <hr />

      <ZnContent>
        <b>
          Cet interrupteur permet de couper le service d'envoi des justificatifs
          uniquement (l'actualisation reste toujours possible). Ne pas manipuler
          sans raison !
        </b>
        {isFilesActivated !== null && (
          <div>
            <Form.Item
              label={
                isFilesActivated ? (
                  "L'envoi de justificatifs est Activé"
                ) : (
                  <b>L'envoi de justificatifs est désactivé</b>
                )
              }
            >
              <Switch checked={isFilesActivated} onChange={updateFilesStatus} />
            </Form.Item>
          </div>
        )}
      </ZnContent>
    </div>
  );
}
