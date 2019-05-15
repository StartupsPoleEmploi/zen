import React, { Component, Fragment } from 'react'

import moment from 'moment'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import Typography from '@material-ui/core/Typography'
import VerticalAlignBottom from '@material-ui/icons/VerticalAlignBottom'
import Print from '@material-ui/icons/Print'

import MainActionButton from '../../components/Generic/MainActionButton'
import moneyBank from '../../images/money-bank.svg'

const DECLARATION_FILE_URL = '/api/declarations/summary-file'

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

const actionButtonStyle = {
  flex: 1,
  padding: '1rem 1.5rem',
  lineHeight: '2.2rem',
  fontSize: '1.6rem',
}

const downloadButtonStyle = { ...actionButtonStyle, marginRight: '3rem' }

export default class Thanks extends Component {
  constructor(props) {
    super(props)

    this.printIframe = React.createRef()
  }

  state = { showPrintIframe: false }

  printDeclaration = (e) => {
    e.preventDefault()

    if (this.state.showPrintIframe) {
      try {
        this.printIframe.current.contentWindow.print()
      } catch (err) {
        // Some browser, like firefox, can't print an iframe content, so we open a new tab for the PDF
        // For more information : https://bugzilla.mozilla.org/show_bug.cgi?id=874200
        window.open(DECLARATION_FILE_URL, '_blank')
      }
    } else this.setState({ showPrintIframe: true })
  }

  printIframeContent = (e) => {
    try {
      e.target.contentWindow.print()
    } catch (err) {
      // Some browser, like firefox, can't print an iframe content, so we open a new tab for the PDF
      // For more information : https://bugzilla.mozilla.org/show_bug.cgi?id=874200
      window.open(DECLARATION_FILE_URL, '_blank')
    }
  }

  render() {
    const { showPrintIframe } = this.state
    const { activeMonth } = this.props

    return (
      <StyledThanks>
        <StyledImg src={moneyBank} alt="" />
        {!this.props.location.search.includes('later') ? (
          <Fragment>
            <Title variant="h6">
              Merci, votre actualisation et l'envoi de vos documents sont
              terminés
              {activeMonth
                ? ` pour le mois de ${moment(activeMonth).format('MMMM')} ! ` // eslint-disable-line no-irregular-whitespace
                : ' '}
              <span aria-hidden="true">👍</span>
            </Title>

            <ButtonsContainers>
              <MainActionButton
                primary={false}
                href="/api/declarations/summary-file?download=true"
                target="_blank"
                title="Télécharger votre déclaration au format PDF (Nouvelle fenêtre)"
                style={downloadButtonStyle}
              >
                <StyledDownload />
                <ButtonText>
                  Télécharger
                  <br /> ma déclaration
                </ButtonText>
              </MainActionButton>
              <MainActionButton
                primary={false}
                onClick={this.printDeclaration}
                style={actionButtonStyle}
              >
                <StyledPrint />
                <ButtonText>
                  Imprimer
                  <br /> ma déclaration
                </ButtonText>
              </MainActionButton>
            </ButtonsContainers>

            <Typography paragraph>
              Pôle Emploi va recevoir et traiter les documents que vous nous
              avez fait parvenir. Si vous rencontrez un problème ou si vous vous
              posez des questions, vous pouvez joindre votre conseiller depuis
              votre espace personnel.
            </Typography>
            <br />
            <Typography paragraph>
              Si vous souhaitez transmettre d'autres documents pour de
              précédentes actualisations effectuées via Zen,{' '}
              <Link to="/files">
                cliquez ici pour revenir à la page d'envoi de documents.
              </Link>
            </Typography>

            {showPrintIframe && (
              <iframe
                src={DECLARATION_FILE_URL}
                title="Aucun contenu (dispositif technique)"
                style={{ display: 'none' }}
                ref={this.printIframe}
                id="declarationIframe"
                onLoad={this.printIframeContent}
              />
            )}
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
}

Thanks.propTypes = {
  activeMonth: PropTypes.instanceOf(Date),
  location: PropTypes.shape({ search: PropTypes.string.isRequired }).isRequired,
}
