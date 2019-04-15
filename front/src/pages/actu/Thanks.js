import React, { Fragment } from 'react'

import moment from 'moment'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import Typography from '@material-ui/core/Typography'
import VerticalAlignBottom from '@material-ui/icons/VerticalAlignBottom'
import Print from '@material-ui/icons/Print'

import MainActionButton from '../../components/Generic/MainActionButton'
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
  padding: 4rem 0 6rem 0;
`

const ButtonsContainers = styled.div`
  display: flex;
  margin: auto;
  text-align: center;
  margin-bottom: 5rem;
`

const DownloadButton = styled(MainActionButton)`
  && {
    flex: 1;
    width: 20rem;
    padding: 1rem 1.5rem;
    line-height: 2.2rem;
    font-size: 1.6rem;
  }
`

const ButtonText = styled.span`
  flex: 5;
`

const StyledDownload = styled(VerticalAlignBottom)`
  && {
    flex: 1;
    color: #39679e;
    font-size: 3rem;
  }
`

const StyledPrint = styled(Print)`
  && {
    flex: 1;
    color: #39679e;
    font-size: 3rem;
    margin-right: 1rem;
  }
`

export const Thanks = ({ activeMonth, location: { search } }) => {
  const isDeclarationFinished = !search.includes('later')

  function downloadFiles() {
    alert('Download')
  }

  function printFiles() {
    alert('Print')
  }

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
            <span aria-hidden="true">👍</span>
          </Title>

          <ButtonsContainers>
            <DownloadButton
              primary={false}
              onClick={downloadFiles}
              style={{ marginRight: '3rem' }}
            >
              <StyledDownload />
              <ButtonText>
                Télécharger
                <br /> ma déclaration
              </ButtonText>
            </DownloadButton>
            <DownloadButton primary={false} onClick={printFiles}>
              <StyledPrint />
              <ButtonText>
                Imprimer
                <br /> ma déclaration
              </ButtonText>
            </DownloadButton>
          </ButtonsContainers>

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
