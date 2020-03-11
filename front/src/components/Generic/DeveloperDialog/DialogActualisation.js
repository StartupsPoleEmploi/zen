import Button from '@material-ui/core/Button'
import DialogContentText from '@material-ui/core/DialogContentText'
import TextField from '@material-ui/core/TextField'
import React, { Fragment, useEffect, useState } from 'react'
import superagent from 'superagent'
import moment from 'moment'

import catchMaintenance from '../../../lib/catchMaintenance'

export default function DialogUser() {
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(null)
  const [error, setError] = useState(null)
  const [endDate, setEndDate] = useState(null)

  const submit = () => {
    try {
      superagent
        .post('/api/developer/current-month', { id: currentMonth.id, endDate })
        .then(() => window.location.reload(true))
        .catch(catchMaintenance)
        .catch((err) => setError(`Erreur serveur : ${err}`))
    } catch (err) {
      return setError(`Le JSON est invalide : ${err}`)
    }
  }

  useEffect(() => {
    superagent.get('/api/developer/current-month').then(({ body }) => {
      setCurrentMonth(body)
      setEndDate(body.endDate)
      setLoading(false)
    })
    .catch(catchMaintenance)
  }, [])

  return (
    <Fragment>
      <DialogContentText paragraph>
        Permet de changer la date de fin de la déclaration du mois courant.
      </DialogContentText>
      {loading &&
        <DialogContentText paragraph>
          LOADING ...
        </DialogContentText>
      }
      {!loading && !!error &&
        <DialogContentText paragraph>
          {`Error: ${error}`}
        </DialogContentText>
      }
      {!loading && !error && !!currentMonth &&
        <DialogContentText paragraph style={{textAlign: 'left'}}>
          <ul>
            <li><b>Id : </b>{currentMonth.id}</li>
            <li><b>Mois de : </b>{moment(currentMonth.month).format('MMMM YYYY')}</li>
            <li><b>Débute le : </b>{moment(currentMonth.startDate).format('DD/MM/YYYY HH:mm:ss')}</li>
            <li>
              <b>Fini le : </b>
              <TextField
                id="datetime-local"
                type="datetime-local"
                defaultValue={moment(endDate).format('YYYY-MM-DDTHH:mm')}
                InputLabelProps={{ shrink: true}}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </li>
          </ul>
        </DialogContentText>
      }

      <Button variant="contained" onClick={submit} color="primary" style={{marginTop: '2rem'}}>
        Mettre à jour date de fin
      </Button>
    </Fragment>
  )
}
