import React, { useState } from 'react'
import superagent from 'superagent'
import styles from '../style/declarationsFiles.module.css'

const UPDATE_USERS_STATUS_URL = '/zen-admin-api/update-users-status'
const UPDATE_DECLARATION_USERS_STATUS_URL =
  '/zen-admin-api/update-declaration-users-status'

const DeclarationFiles = () => {
  const [userStatusOnGoing, setUserStatusOnGoing] = useState(false)
  const [userStatusSuccess, setUserStatusSuccess] = useState(false)
  const [userStatusError, setUserStatusError] = useState(false)

  const [
    userDeclarationMonthStatusOnGoing,
    setUserDeclarationMonthStatusOnGoing,
  ] = useState(false)
  const [
    userDeclarationMonthStatusSuccess,
    setUserDeclarationMonthStatusSuccess,
  ] = useState(false)
  const [
    userDeclarationMonthStatusError,
    setUserDeclarationMonthStatusError,
  ] = useState(false)

  function uploadToUrl(url, formData) {
    return superagent.post(url).attach('document', formData.get('file'))
  }

  function submitUserStatus(e) {
    e.preventDefault()
    setUserStatusOnGoing(true)
    setUserStatusSuccess(false)
    setUserStatusError(false)

    uploadToUrl(UPDATE_USERS_STATUS_URL, new FormData(e.target))
      .then(() => {
        setUserStatusSuccess(true)
        setUserStatusOnGoing(false)
      })
      .catch(() => {
        setUserStatusError(true)
        setUserStatusOnGoing(false)
      })
  }

  function submitMonthDeclarationFile(e) {
    e.preventDefault()
    setUserDeclarationMonthStatusOnGoing(true)
    setUserDeclarationMonthStatusOnGoing(false)
    setUserDeclarationMonthStatusOnGoing(false)
    uploadToUrl(UPDATE_DECLARATION_USERS_STATUS_URL, new FormData(e.target))
      .then(() => {
        setUserDeclarationMonthStatusSuccess(true)
        setUserDeclarationMonthStatusOnGoing(false)
      })
      .catch(() => {
        setUserDeclarationMonthStatusError(true)
        setUserDeclarationMonthStatusOnGoing(false)
      })
  }

  return (
    <div className={styles.center}>
      <h1>Fichiers demandeurs d'emploi</h1>
      <b>
        Cette page permet permet d'uploader les fichiers renvoyés par le
        DataLake : demandeurs éligibles (non radiés) et demandeurs n'ayant pas
        réalisé leur actualisation (ni sur Zen ni sur Pe.fr) !
      </b>

      <div className={styles.flex}>
        <div className={styles.container}>
          <h2>Statut des demandeurs : radiés ou non</h2>
          <div className={styles.alert}>
            <p>
              Ce fichier réalise met à jour deux informations sur les
              utilisateurs :
            </p>
            <ul style={{ listStyle: 'none' }}>
              <li>=> sont-ils radiés ou non ?</li>
              <li>=> sont-ils éligibles pour la prochaine actualisation ?</li>
            </ul>
            <p>
              <strong>
                À n'utiliser que la veille d'une actualisation (soit le 27 du
                mois)
              </strong>
              <br />
              <em className={styles.small}>
                Les utilisateurs créés lors des dernières 24h ne seront pas
                modifiés (car potentiellement non présents dans ce fichier).
              </em>
            </p>
          </div>
          <form
            onSubmit={submitUserStatus}
            encType="multipart/form-data"
            method="POST"
          >
            <div>
              {userStatusSuccess && (
                <div className={styles.success}>Utilisateurs mis à jour</div>
              )}
              {userStatusError && (
                <div className={styles.alert}>
                  Erreur lors de la mise à jour !
                </div>
              )}

              <label htmlFor="upload-users-status">
                Fichier des utilisateurs de Zen non radiés:
                <br />
                <input
                  id="upload-users-status"
                  type="file"
                  name="file"
                  accept=".csv"
                  required
                />
              </label>
              <br />
            </div>
            <input
              type="submit"
              style={{ marginTop: '20px' }}
              disabled={userStatusOnGoing}
              value={userStatusOnGoing ? 'Traitement...' : 'Valider'}
            />
          </form>
        </div>
        <div className={styles.container}>
          <h2>Statut des actualisations du mois : faite ou non</h2>
          <p className={styles.alert}>
            Les emails présents dans ce fichier seront considérés comme n'ayant
            pas réalisé leur actualisation (ni sur Zen ni sur PE) en prévision
            des mails envoyés le 7,10 et le 14.
            <br />
            <strong>
              À n'utiliser que la veille d'une campagne de mailing (soit
              théoriquement le 6, 10 et 14 du mois)
            </strong>
            <br />
            <em className={styles.small}>
              Les utilisateurs créés lors des dernières 24h ne seront pas
              modifiés (car potentiellement non présents dans ce fichier).
            </em>
          </p>

          <form
            onSubmit={submitMonthDeclarationFile}
            encType="multipart/form-data"
            method="POST"
          >
            <div>
              {userDeclarationMonthStatusSuccess && (
                <div className={styles.success}>Utilisateurs mis à jour</div>
              )}
              {userDeclarationMonthStatusError && (
                <div className={styles.alert}>
                  Erreur lors de la mise à jour !
                </div>
              )}

              <label htmlFor="upload-declaration-month-users">
                Fichier des utilisateurs n'ayant pas réalisé leur actualisation
                (via PE ou Zen) :<br />
                <input
                  id="upload-declaration-month-users"
                  type="file"
                  name="file"
                  accept=".csv"
                  required
                />
              </label>
              <br />
            </div>
            <input
              disabled={userDeclarationMonthStatusOnGoing}
              style={{ marginTop: '20px' }}
              value={
                userDeclarationMonthStatusOnGoing ? 'Traitement...' : 'Valider'
              }
              type="submit"
            />
          </form>
        </div>
      </div>
    </div>
  )
}

export default DeclarationFiles
