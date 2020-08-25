import React, { useState, useEffect } from 'react';
import superagent from 'superagent';
import { Switch, Form, Button } from 'antd';

import { useUseradmin } from '../../common/contexts/useradminCtx';
import ZnContent from '../../components/ZnContent';
import ZnHeader from '../../components/ZnHeader';
import { useDeclarations } from '../../common/contexts/declarationsCtx';

export default function Settings() {
  const [isGlobalActivated, setIsGlobalActivated] = useState(null);
  const [isFilesActivated, setIsFilesActivated] = useState(null);
  const { removeDeclarations } = useDeclarations();
  const { logoutIfNeed } = useUseradmin();

  useEffect(() => {
    superagent.get('/zen-admin-api/settings/status').then(({ body }) => {
      setIsGlobalActivated(body.global.up);
      setIsFilesActivated(body.files.up);
    }).catch(logoutIfNeed);
  }, [logoutIfNeed]);

  const updateGlobalStatus = () => {
    superagent
      .post('/zen-admin-api/settings/status-global', { up: !isGlobalActivated })
      .then(({ body }) => setIsGlobalActivated(body.up))
      .catch(logoutIfNeed);
  };

  const updateFilesStatus = () => {
    superagent
      .post('/zen-admin-api/settings/status-files', { up: !isFilesActivated })
      .then(({ body }) => setIsFilesActivated(body.isFilesServiceUp))
      .catch(logoutIfNeed);
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

      {process.env.REACT_APP_ZEN_ENV !== 'production' && (
        <>
          <hr />
          <ZnContent>
            <b>
            Ce bouton permet, après confirmation, de supprimer toutes les
            actualisations de ce mois-ci. Ne pas manipuler sans raison !
            </b>
            <ZnContent>
              <Button onClick={removeDeclarations} danger>
              Supprimer les actualisations du mois
              </Button>
            </ZnContent>
          </ZnContent>
        </>
      ) }
    </div>
  );
}
