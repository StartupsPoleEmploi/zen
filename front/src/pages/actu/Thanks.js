import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import ArrowRightAlt from '@material-ui/icons/ArrowRightAlt';
import Check from '@material-ui/icons/Check';

import { Redirect } from 'react-router';
import MainActionButton from '../../components/Generic/MainActionButton';
import SuccessSnackBar from '../../components/Generic/SuccessSnackBar';
import {
  hideSnackbarUpload as hideSnackbarUploadAction,
} from '../../redux/actions/thanks';
import thankImg from '../../images/thank.svg';

import {
  fetchDeclarations as fetchDeclarationAction,
} from '../../redux/actions/declarations';

const DECLARATION_FILE_URL = '/api/declarations/summary-file';

const StyledThanks = styled.div`
  margin: auto;
  text-align: center;
  width: 100%;
  max-width: 62rem;
`;

const Title = styled(Typography).attrs({ component: 'h1' })`
  padding: 4rem 0 6rem 0;
`;

const ButtonsContainers = styled.div`
  display: flex;
  margin: auto;
  align-items: center;
  text-align: center;

  @media (max-width: 850px) {
    flex-direction: column;
  }
`;

const Complementary = styled.div`
  margin-top: 5rem;
  padding: 3rem 1rem 2rem 1rem;
  border-top: 1px solid black;
`;

const StyledTitle = styled(Typography)`
  && {
    margin-bottom: 1.5rem;
    text-align: center;
  }
`;

const Text = styled(Typography)`
font-size: 18px;
`;

const StyledThxImg = styled.img`
  max-width: 30rem;
  width: 80%;
`;

const TitleThx = styled(Typography).attrs({ component: 'h1' })`
  padding: 0 0 0.5rem 0;
  font-size: 22px !important;
`;

const BtnThx = styled(MainActionButton)`
white-space: nowrap;
width: auto !important;
padding: 0 4rem !important;
`;

const StyledArrowRightAlt = styled(ArrowRightAlt)`
  margin-left: 1rem;
`;

const CheckIcon = styled(Check)`
  && {
    margin-right: 1rem;
    color: green;
    vertical-align: sub;
  }
`;

export class Thanks extends Component {
  constructor(props) {
    super(props);

    this.printIframe = React.createRef();
  }

  state = {
    showPrintIframe: false,
    showSurvey: false,
  }

  componentDidMount() {
    this.props.fetchDeclarations();

    const lastResponse = localStorage.getItem(`survey-response-${this.props.user.id}`);
    const now = new Date();

    const showSurvey = lastResponse === null ||
      new Date(lastResponse).getMonth() !== now.getMonth();
    this.setState({ showSurvey });
  }

  onMemorizeAction = () => {
    localStorage.setItem(`survey-response-${this.props.user.id}`, new Date());
    this.setState({ showSurvey: false });
  }

  printDeclaration = (e) => {
    e.preventDefault();

    if (this.state.showPrintIframe) {
      try {
        this.printIframe.current.contentWindow.print();
      } catch (err) {
        // Some browser, like firefox, can't print an iframe content, so we open a new tab for the PDF
        // For more information : https://bugzilla.mozilla.org/show_bug.cgi?id=874200
        window.open(DECLARATION_FILE_URL, '_blank');
      }
    } else this.setState({ showPrintIframe: true });
  }

  printIframeContent = (e) => {
    try {
      e.target.contentWindow.print();
    } catch (err) {
      // Some browser, like firefox, can't print an iframe content, so we open a new tab for the PDF
      // For more information : https://bugzilla.mozilla.org/show_bug.cgi?id=874200
      window.open(DECLARATION_FILE_URL, '_blank');
    }
  }

  render() {
    const { showPrintIframe } = this.state;
    const { hideSnackbarUpload, showSnackbarUploadSuccess } = this.props;

    if (this.props.declarations.every((d) => d.isFinished) === false) {
      if (this.props.totalMissingFiles !== 0) {
        return <Redirect to="/files" />;
      }
      return <Redirect to="/dashboard" />;
    }

    return (
      <StyledThanks>
        {!this.props.location.search.includes('later') ? (
          <>
            <StyledTitle variant="h4" className="error-title">
              Félicitations, votre dossier est à jour.
            </StyledTitle>
            <Text paragraph>
              Soyez Zen, aucun justificatif à transmettre
            </Text>
            <StyledThxImg src={thankImg} alt="" />
            {this.state.showSurvey ? (
              <>
                <TitleThx variant="h4" style={{ marginTop: '4rem' }}>
                  Quelques minutes devant vous ?
                </TitleThx>
                <Text paragraph>
                  Aidez-nous à améliorer Zen en donnant votre avis
                </Text>
                <a href="https://surveys.hotjar.com/s?siteId=929102&surveyId=156996" rel="noopener noreferrer" target="_blank" style={{ textDecoration: 'none' }} onClick={this.onMemorizeAction}>
                  <BtnThx color="primary" primary>
                    Je donne mon avis
                    <StyledArrowRightAlt />
                  </BtnThx>
                </a>
              </>
            ) : (
              <>
                <TitleThx variant="h4" style={{ marginTop: '4rem' }}>
                  <CheckIcon />
                  {' '}
                  Merci, vous avez participé ce mois-ci
                </TitleThx>
                <Text paragraph>
                  Rendez-vous le mois prochain pour nous aider à améliorer Zen
                </Text>
                <BtnThx color="primary" primary disabled>
                  Je donne mon avis
                  <StyledArrowRightAlt />
                </BtnThx>
              </>
            )}

            <ButtonsContainers style={{ marginTop: '64px' }}>
              <MainActionButton
                href="/api/declarations/summary-file?download=true"
                target="_blank"
                title="Télécharger votre déclaration au format PDF (Nouvelle fenêtre)"
                style={{
                  minWidth: '30rem',
                }}
                primary
              >
                Télécharger ma déclaration
              </MainActionButton>

              <Typography paragraph style={{ margin: '1rem' }}>
                ou
              </Typography>

              <MainActionButton
                primary={false}
                onClick={this.printDeclaration}
                style={{
                  minWidth: '30rem',
                }}
                variant="outlined"
              >
                Imprimer ma déclaration
              </MainActionButton>
            </ButtonsContainers>

            <Complementary>
              <Typography paragraph>
                <strong>Un problème ? Une question ?</strong>
                <br />
                Vous pouvez joindre votre conseiller depuis votre espace
                personnel sur
                {' '}
                <a href="https://www.pole-emploi.fr">pole-emploi.fr</a>
                <br />
                ou
                {' '}
                <a
                  href="https://zen.pole-emploi.fr/zen-doc"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="ouverture dans une nouvelle fenêtre"
                >
                  consulter notre FAQ
                </a>
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
          </>
        ) : (
          <>
            <Title variant="h6">
              Merci, vos données ont bien été enregistrées.
            </Title>
            <Typography paragraph>
              Vous pourrez reprendre ultérieurement.
            </Typography>
            <StyledThxImg src={thankImg} alt="" />
            <div>
              <ErrorOutlineIcon
                style={{ color: '#1F2C59', fontSize: 40, marginTop: '4rem' }}
              />
              <Typography paragraph style={{ fontSize: '1.7rem' }}>
                N’oubliez pas de revenir avant le 15 pour valider votre
                actualisation.
                <br />
                Un e-mail de rappel vous sera envoyé.
              </Typography>
            </div>
          </>
        )}
        {showSnackbarUploadSuccess && (
          <SuccessSnackBar
            message={"Nous n'avons pas besoin de votre bulletin de salaire pour cet employeur car vous venez de nous transmettre l'attestation employeur"}
            onHide={() => hideSnackbarUpload()}
            closeIcon
            duraction={null}
          />
        )}
      </StyledThanks>
    );
  }
}

Thanks.propTypes = {
  location: PropTypes.shape({ search: PropTypes.string.isRequired }).isRequired,
  showSnackbarUploadSuccess: PropTypes.bool.isRequired,
  hideSnackbarUpload: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  fetchDeclarations: PropTypes.func.isRequired,
  declarations: PropTypes.arrayOf(PropTypes.object),
  totalMissingFiles: PropTypes.number,
};

export default connect(
  (state) => ({
    declarations: state.declarationsReducer.declarations,
    totalMissingFiles: state.declarationsReducer.missingFiles,
    showSnackbarUploadSuccess: state.thanksReducer.showSnackbarUploadSuccess,
    user: state.userReducer.user,
  }),
  {
    fetchDeclarations: fetchDeclarationAction,
    hideSnackbarUpload: hideSnackbarUploadAction,
  },
)(Thanks);
