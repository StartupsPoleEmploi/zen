// @flow

import React from 'react';
import { Card } from 'antd';

import IconBoolean from '../../../components/IconBoolean';

type Props = {
  declaration: Object,
}

export default function DeclarationDetails({ declaration }: Props) {
  return (
    <div>
      <Card title="Détails" style={{ marginBottom: '20px' }}>
        <table border="1">
          <tbody>
            <tr>
              <td><b>Id</b></td>
              <td>{declaration.id}</td>
            </tr>
            <tr>
              <td><b>Avoir travaillé ?</b></td>
              <td><IconBoolean val={declaration.hasWorked} /></td>
            </tr>
            <tr>
              <td><b>Avoir été en formation ?</b></td>
              <td><IconBoolean val={declaration.hasTrained} /></td>
            </tr>
            <tr>
              <td><b>Avoir été en stage ?</b></td>
              <td><IconBoolean val={declaration.hasInternship} /></td>
            </tr>
            <tr>
              <td>
                <b>
                  {`Avoir été en arrêt maladie${
                    declaration.user.gender === 'male'
                      ? ' ou en congé paternité'
                      : ''
                    // eslint-disable-next-line no-irregular-whitespace
                  } ?`}
                </b>
              </td>
              <td><IconBoolean val={declaration.hasSickLeave} /></td>
            </tr>
            <tr>
              <td><b>Avoir été en congé maternité ?</b></td>
              <td><IconBoolean val={declaration.hasMaternityLeave} /></td>
            </tr>
            <tr>
              <td><b>Avoir percu une nouvelle pension retraite ?</b></td>
              <td><IconBoolean val={declaration.hasRetirement} /></td>
            </tr>
            <tr>
              <td>
                <b>
                Avoir une nouvelle pension d'invalidité
                  <br />
                de 2eme ou 3eme catégorie ?
                </b>
              </td>
              <td><IconBoolean val={declaration.hasInvalidity} /></td>
            </tr>
            <tr>
              <td><b>Souhaite rester inscrit à Pôle emploi ?</b></td>
              <td><IconBoolean val={declaration.isLookingForJob} /></td>
            </tr>
            <tr>
              <td><b>Avoir fini le formulaire de declaration d'employer ?</b></td>
              <td><IconBoolean val={declaration.hasFinishedDeclaringEmployers} /></td>
            </tr>
            <tr>
              <td><b>Transmis le</b></td>
              <td>{declaration.transmittedAt}</td>
            </tr>
            <tr>
              <td><b>Créé le</b></td>
              <td>{declaration.createdAt}</td>
            </tr>
            <tr>
              <td><b>Modifié le</b></td>
              <td>{declaration.updatedAt}</td>
            </tr>
            <tr>
              <td><b>Utilisateur a fini sa déclaration ?</b></td>
              <td><IconBoolean val={declaration.isFinished} /></td>
            </tr>
            <tr>
              <td><b>Email avoir été envoyé ?</b></td>
              <td><IconBoolean val={declaration.isEmailSent} /></td>
            </tr>
            <tr>
              <td><b>isDocEmailSent</b></td>
              <td><IconBoolean val={declaration.isDocEmailSent} /></td>
            </tr>
            <tr>
              <td><b>isCleanedUp</b></td>
              <td><IconBoolean val={declaration.isCleanedUp} /></td>
            </tr>
            <tr>
              <td><b>Identifiant utilisateur</b></td>
              <td>{declaration.userId}</td>
            </tr>
            <tr>
              <td><b>Identifiant du mois</b></td>
              <td>{declaration.monthId}</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
