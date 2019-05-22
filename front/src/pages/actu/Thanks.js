import React, { Component, Fragment } from 'react'

import PropTypes from 'prop-types'
import styled from 'styled-components'

import Typography from '@material-ui/core/Typography'
import MainActionButton from '../../components/Generic/MainActionButton'
import sendDoc from '../../images/sendDoc.svg'

const DECLARATION_FILE_URL = '/api/declarations/summary-file'

const StyledThanks = styled.div`
  margin: auto;
  text-align: center;
  width: 62rem;
  max-width: 100%;
`

const StyledImg = styled.img`
  max-width: 30rem;
  width: 100%;
  margin-top: 5rem;
`

const Title = styled(Typography).attrs({ component: 'h1' })`
  padding: 4rem 0 6rem 0;
`

const ButtonsContainers = styled.div`
  display: flex;
  margin: auto;
  align-items: center;
  text-align: center;

  @media (max-width: 850px) {
    flex-direction: column;
  }
`

const MainActionButtonStyled = styled(MainActionButton)`
  && {
    flex: 1;
    padding: 0.5rem 4rem;
    height: 5rem;
    border-radius: 3rem;

    @media (max-width: 850px) {
      width: 30rem;
      margin: 1rem 0;
      padding: 1rem;
    }
  }
`

const Complementary = styled.div`
  background-color: #f2f2f2;
  position: absolute;
  width: 100%;
  left: 0;
  margin-top: 5rem;
  padding: 3rem 1rem 2rem 1rem;
`

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

    return (
      <StyledThanks>
        <StyledImg src={sendDoc} alt="" />
        {!this.props.location.search.includes('later') ? (
          <Fragment>
            <Title variant="h6" style={{ paddingBottom: '3rem' }}>
              Merci, vos justificatifs ont été bien transmis
              <br />
              et seront traités dans les plus brefs délais.
            </Title>

            <Typography paragraph style={{ paddingBottom: '3rem' }}>
              Pas d'envoyer vos justificatifs sur <br />
              <a href="https://www.pole-emploi.fr">pole-emploi.fr</a>,{' '}
              <strong>Zen s'en charge pour vous !</strong>
            </Typography>

            <ButtonsContainers>
              <MainActionButtonStyled
                href="/api/declarations/summary-file?download=true"
                target="_blank"
                title="Télécharger votre déclaration au format PDF (Nouvelle fenêtre)"
              >
                Télécharger ma déclaration
              </MainActionButtonStyled>

              <Typography paragraph style={{ margin: '0 1rem' }}>
                ou
              </Typography>

              <MainActionButtonStyled
                primary={false}
                onClick={this.printDeclaration}
              >
                Imprimer ma déclaration
              </MainActionButtonStyled>
            </ButtonsContainers>

            <Complementary>
              <Typography paragraph>
                <strong>Un problème ? Une question ?</strong>
                <br />
                Vous pouvez joindre votre conseiller depuis votre espace
                personnel sur{' '}
                <a href="https://www.pole-emploi.fr">pole-emploi.fr</a>
                <br />
                ou consulter notre FAQ
              </Typography>
            </Complementary>

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
  location: PropTypes.shape({ search: PropTypes.string.isRequired }).isRequired,
}
