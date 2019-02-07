import Typography from '@material-ui/core/Typography'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import moneyBank from '../../images/money-bank.svg'

const StyledThanks = styled.div`
  margin: auto;
  text-align: center;
  max-width: 48rem;
`

const StyledImg = styled.img`
  max-width: 30rem;
  width: 100%;
`

const Title = styled(Typography)`
  padding: 4rem 0;
`

export const Thanks = ({ activeMonth, location: { search } }) => {
  const isDeclarationFinished = !search.includes('later')

  return (
    <StyledThanks>
      <StyledImg src={moneyBank} alt="" />
      {isDeclarationFinished ? (
        <Fragment>
          <Title variant="h6">
            Merci, votre actualisation et l'envoi de vos documents sont terminés
            {activeMonth
              ? ` pour le mois de ${moment(activeMonth).format('MMMM')} ! ` // eslint-disable-line no-irregular-whitespace
              : ' '}
            <span role="img" aria-label="Pouce levé">
              👍
            </span>
          </Title>
          <Typography paragraph>
            Pôle Emploi va recevoir et traiter les documents que vous nous avez
            fait parvenir. Si vous rencontrez un problème ou si vous vous posez
            des questions, vous pouvez joindre votre conseiller depuis votre
            espace personnel.
          </Typography>
          <br />
          <Typography paragraph>
            Si vous souhaitez transmettre d'autres documents pour de précédentes
            actualisations effectuées via Zen,{' '}
            <Link to="/files">
              cliquez ici pour revenir à la page d'envoi de documents.
            </Link>
          </Typography>
        </Fragment>
      ) : (
        <Fragment>
          <Title variant="h6">
            Merci, vos données ont bien été enregistrées.
          </Title>
          <Typography paragraph>
            Vous pourrez reprendre ultérieurement.
          </Typography>
        </Fragment>
      )}
    </StyledThanks>
  )
}

Thanks.propTypes = {
  activeMonth: PropTypes.instanceOf(Date),
  location: PropTypes.shape({ search: PropTypes.string.isRequired }).isRequired,
}

export default Thanks
