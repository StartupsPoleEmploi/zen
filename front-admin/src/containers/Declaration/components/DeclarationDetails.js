// @flow

import React from 'react';
import { Card, Icon } from 'antd';

type Props = {
  declaration: Object,
}

function boolToStr(val) {
  return val ? <Icon type="check" style={{ color: 'green' }} />
    : <Icon type="close" style={{ color: 'red' }} />;
}

export default function DeclarationDetails({ declaration }: Props) {
  return (
    <div>
      <Card title="Détails" style={{ marginBottom: '20px' }}>
        <table border="1">
          <tr>
            <td><b>Id</b></td>
            <td>{declaration.id}</td>
          </tr>
          <tr>
            <td><b>Avoir travaillé ?</b></td>
            <td>{boolToStr(declaration.hasWorked)}</td>
          </tr>
          <tr>
            <td><b>Avoir été en formation ?</b></td>
            <td>{boolToStr(declaration.hasTrained)}</td>
          </tr>
          <tr>
            <td><b>Avoir été en stage ?</b></td>
            <td>{boolToStr(declaration.hasInternship)}</td>
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
            <td>{boolToStr(declaration.hasSickLeave)}</td>
          </tr>
          <tr>
            <td><b>Avoir été en congé maternité ?</b></td>
            <td>{boolToStr(declaration.hasMaternityLeave)}</td>
          </tr>
          <tr>
            <td><b>Avoir percus une nouvelle pension retraite ?</b></td>
            <td>{boolToStr(declaration.hasRetirement)}</td>
          </tr>
          <tr>
            <td>
              <b>
                Avoir une nouvelle pension d'invalidité
                <br />
                de 2eme ou 3eme catégorie ?
              </b>
            </td>
            <td>{boolToStr(declaration.hasInvalidity)}</td>
          </tr>
          <tr>
            <td><b>Souhaite rester inscrit à Pôle emploi ?</b></td>
            <td>{boolToStr(declaration.isLookingForJob)}</td>
          </tr>
          <tr>
            <td><b>Avoir fini de le formulaire de declaration d'employer ?</b></td>
            <td>{boolToStr(declaration.hasFinishedDeclaringEmployers)}</td>
          </tr>
          <tr>
            <td><b>Transmit le</b></td>
            <td>{declaration.transmittedAt}</td>
          </tr>
          <tr>
            <td><b>Créer le</b></td>
            <td>{declaration.createdAt}</td>
          </tr>
          <tr>
            <td><b>Modifié le</b></td>
            <td>{declaration.updatedAt}</td>
          </tr>
          <tr>
            <td><b>Utilisateur a fini sa déclaration ?</b></td>
            <td>{boolToStr(declaration.isFinished)}</td>
          </tr>
          <tr>
            <td><b>Email avoir été envoyé ?</b></td>
            <td>{boolToStr(declaration.isEmailSent)}</td>
          </tr>
          <tr>
            <td><b>isDocEmailSent</b></td>
            <td>{boolToStr(declaration.isDocEmailSent)}</td>
          </tr>
          <tr>
            <td><b>isCleanedUp</b></td>
            <td>{boolToStr(declaration.isCleanedUp)}</td>
          </tr>
          <tr>
            <td><b>Identifiant utilisateur</b></td>
            <td>{declaration.userId}</td>
          </tr>
          <tr>
            <td><b>Identifiant du mois</b></td>
            <td>{declaration.monthId}</td>
          </tr>
        </table>
      </Card>
    </div>
  );
}
