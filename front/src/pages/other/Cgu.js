import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { makeStyles } from '@material-ui/core/styles'
import { Typography, Link } from '@material-ui/core'

import { H1, H2, H3 } from '../../components/Generic/Titles'

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(4, 2),
    backgroundColor: (props) => (props.isLogin ? 'inherit' : '#f3f4f5'),
    [theme.breakpoints.up('md')]: {
      paddingLeft: '15%',
      paddingRight: '15%',
    },
  },
  title: {
    paddingBottom: theme.spacing(2),
  },
  titlePoint: {
    color: theme.palette.primary.main,
    paddingRight: theme.spacing(1),
  },
  title2: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(1),
  },
  title3: {
    fontWeight: 'bold',
    fontSize: '1.6rem',
  },
  text: {
    marginBottom: theme.spacing(1),
  },
  cookieContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  cookieBlock: {
    marginTop: theme.spacing(2),
  },
}))

function Title2({ num, children }) {
  const classes = useStyles()
  return (
    <H2 variant="h4" className={classes.title2}>
      <span className={classes.titlePoint}>{num}.</span>
      {children}
    </H2>
  )
}
Title2.propTypes = {
  children: PropTypes.node.isRequired,
  num: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node])
    .isRequired,
}

function Title3({ children }) {
  const classes = useStyles()
  return (
    <H3 className={classes.title3} variant="p">
      <span style={{ fontSize: '4rem', marginRight: '0.5rem' }}>.</span>
      {children}
    </H3>
  )
}
Title3.propTypes = { children: PropTypes.node.isRequired }

function Text({ children, ...rest }) {
  const { text } = useStyles()
  return (
    <Typography className={text} {...rest}>
      {children}
    </Typography>
  )
}
Text.propTypes = { children: PropTypes.node.isRequired }

function Cgu({ isLogin }) {
  const classes = useStyles({ isLogin })
  return (
    <div container className={classes.container}>
      <H1 style={{ fontSize: '3rem' }} className={classes.title}>
        Conditions générales d’utilisation
      </H1>
      <Text>
        L’utilisateur du service doit respecter ces conditions générales
        d’utilisation. Elles peuvent être modifiées par Pôle emploi et
        s’imposent à l’utilisateur dès leur mise en ligne. L’utilisateur est
        donc invité à consulter régulièrement la dernière version mise à jour.
      </Text>
      <Text>Dernière modification : 25/11/2019</Text>

      <Title2 num="1">Directeur de la publication et hébergeur</Title2>
      <Text>
        Le directeur de la publication est M. Jean Bassères, directeur général
        de Pôle emploi, dont le siège est situé au 1, avenue du Docteur Gley,
        75020 Paris. Tél : 33(0)140306000
      </Text>
      <Text>
        L’hébergeur du service est OVH (2 rue Kellermann 59100 Roubaix - 09 72
        10 10 07)
      </Text>

      <Title2 num="2">Objet du service</Title2>
      <Text>
        Le site internet{' '}
        <Link href="https://zen.pole-emploi.fr">
          https://zen.pole-emploi.fr
        </Link>{' '}
        est un service de Pôle emploi dédié aux assistant(e)s maternel(le)s de
        France (hormis les régions suivantes : Bourgogne, Franche-Comté, Centre
        Val de Loire et les DOM TOM) permettant faire de façon simple :
        <ul>
          <li>
            l’actualisation mensuelle sur la liste des demandeurs d’emploi ;
          </li>
          <li>l’envoi des justificatifs.</li>
        </ul>
      </Text>
      <Text>
        ZEN vous informe par mail tous les mois du début de la période
        d’actualisation, vous envoie des rappels si nécessaire, et indique les
        justificatifs à transmettre selon votre déclaration.
      </Text>
      <Text>
        ZEN additionne pour vous vos heures travaillées et totalise vos revenus
        mensuels.
      </Text>
      <Text>
        ZEN transmet tous vos justificatifs dans votre espace personnel sur
        pole-emploi.fr.
      </Text>
      <Text>
        A partir de cette déclaration, Pôle emploi renouvelle l’inscription sur
        la liste des demandeurs d’emploi pour le mois suivant conformément à
        l’article L. 5411-2 du code du travail et calcule le montant des
        allocations dues pour les mois passés conformément à l’article L. 5425-1
        du code du travail.
      </Text>

      <Title2 num="3">Identification</Title2>
      <Text>
        Utilisez vos identifiants Pôle emploi pour vous identifier sur ZEN comme
        sur pole-emploi.fr.
      </Text>
      <Text>
        En cas d’oubli de vos identifiants, rendez-vous sur pole-emploi.fr.
      </Text>
      <Text>
        Veillez à la confidentialité du mot de passe ou de l’identifiant et
        demandez la modification du mot de passe ou de l’identifiant lorsqu’ils
        ont été divulgués à une personne non autorisée.
      </Text>

      <Title2 num="4">Protection des données à caractère personnel</Title2>
      <Text>
        Vos données personnelles sont utilisées pour nous permettre de délivrer
        le service décrit à l’article 2.
      </Text>
      <Text>
        Ce traitement est nécessaire à la mission de service publique de pôle
        emploi relatif à la gestion de la liste des demandeurs d’emploi, fixée à
        l’article L. 5312-1 du code du travail. Il est mis en œuvre conformément
        à l’article R. 5312-39 du code du travail.
      </Text>
      <Text>
        Les données peuvent également être utilisées pour faire des
        statistiques, et pour améliorer le service.
      </Text>
      <Text>Vos données sont destinées aux agents de Pôle emploi.</Text>
      <Text>
        ZEN conserve vos données personnelles pendant une durée maximale de 2
        ans à compter de la dernière utilisation des services de Pôle emploi.
      </Text>
      <Text>
        Par ailleurs vos données sont transférées dans les bases de gestion de
        Pôle emploi où elles sont conservées conformément à l’article R. 5312.46
        du code travail.
      </Text>
      <Text>
        Vous pouvez demander à accéder à vos données, à les faire rectifier, à
        limiter le traitement qui en est fait ou prendre des dispositions pour
        le transfert de vos données à tiers au moment de votre décès, en vous
        adressant par courrier postal ou électronique auprès de votre agence
        Pôle emploi, auprès du délégué à la protection des données de Pôle
        emploi, 1, avenue du Docteur Gley, 75987 Paris cedex 20,{' '}
        <Link href="mailto:Courriers-cnil@pole-emploi.fr">
          Courriers-cnil@pole-emploi.fr
        </Link>
        ).
      </Text>

      <Title2 num="5">Cookies et autres traceurs</Title2>
      <Title3>Qu’est-ce qu’un cookie ?</Title3>
      <Text>
        Un cookie est un petit fichier texte déposé sur le terminal des
        utilisateurs (par exemple un ordinateur, une tablette, un « Smartphone
        », etc.) lors de la visite d’un site internet.
      </Text>
      <Text>
        Il contient plusieurs données : le nom du serveur qui l’a déposé, un
        identifiant sous forme de numéro unique, et une date d’expiration. Les
        cookies ont différentes fonctionnalités. Ils ont pour but d’enregistrer
        les paramètres de langue d’un site, de collecter des informations
        relatives à votre navigation sur les sites, d’adresser des services
        personnalisés, etc.
      </Text>
      <Text>
        Seul l’émetteur d’un cookie est susceptible de lire, enregistrer ou de
        modifier les informations qui y sont contenues.
      </Text>

      <Title3>Les cookies déposés sur le site</Title3>
      <Text>
        Sous réserve du choix de l’utilisateur, plusieurs cookies peuvent être
        utilisés sur le site internet http://zen.pole-emploi.fr. Les différentes
        finalités de ces cookies sont décrites ci-dessous.
      </Text>
      <Text>
        <b>
          Cookies strictement nécessaires au fonctionnement du site : cookies
          zen et emploi store développeur/pole-emploi.fr.
        </b>
      </Text>
      <Text>
        <b>
          Cookies statistiques ou de mesure d’audience : google analytics,
          hotjar, mailjet.
        </b>
      </Text>
      <div className={classes.cookieContainer}>
        <Text color="primary" className={classes.cookieBlock}>
          <b>Mailjet</b>
          <br />
          Typologie : <b>Pixel invisible mailjet</b>
          <br />
          Finalites : Suivi d’ouverture des courriels
          <br />
          Duree de vie et de conservation : 13 mois
        </Text>
        <Text color="primary" className={classes.cookieBlock}>
          <b>Google analytics</b>
          <br />
          Typologie : <b>_ga</b>
          <br />
          Finalites : Ce cookie est utilisé pour l’analyse Google Analytics. Il
          permet de suivre les performances des pages consultées par les
          utilisateurs du Site.
          <br />
          Duree de vie et de conservation : 13 mois
        </Text>
        <Text color="primary" className={classes.cookieBlock}>
          Typologie : <b>_gat_UA-119908609-2</b>
          <br />
          Finalites : Ce cookie est utilisé par Google Analytics pour diminuer
          le taux de requêtes en cas de fort trafic.
          <br />
          Duree de vie et de conservation : 12 mois
        </Text>
        <Text color="primary" className={classes.cookieBlock}>
          Typologie : <b>_gid</b>
          <br />
          Finalites : Ce cookie est utilisé par Google Universal Analytics pour
          enregistrer un identifiant unique afin de générer des données
          statistiques sur la façon dont le visiteur utilise le site.
          <br />
          Duree de vie et de conservation : 12 mois
          <br />
        </Text>
        <Text color="primary" className={classes.cookieBlock}>
          <b>Hotjar</b>
          <br />
          Cookies fonctionnels ou de personnalisation : hotjar.
          <br />
        </Text>
      </div>

      <Title3>Accepter ou refuser les cookies</Title3>
      <Text>
        L’utilisateur peut accepter ou refuser le dépôt de tout ou partie des
        cookies, à tout moment, en modifiant les paramètres de son navigateur
        (consulter la fonction « Aide » du navigateur pour en savoir plus) ou en
        se rendant sur l’une des pages suivantes, selon le navigateur utilisé :
        <ul>
          <li>
            Google Chrome :
            (https://support.google.com/chrome/answer/95647?hl=fr)
          </li>
          <li>
            Internet Explorer : (https://support.microsoft.com/fr-fr/help/17442)
          </li>
          <li>
            Mozilla Firefox :
            (https://support.mozilla.org/fr/kb/activer-desactiver-cookies)
          </li>
          <li>
            Safari :
            (https://support.apple.com/fr-fr/guide/safari/sfri11471/mac)
          </li>
        </ul>
      </Text>
      <Text>
        Pour information, la plupart des navigateurs acceptent par défaut le
        dépôt de cookies. L’utilisateur peut modifier ses choix en matière de
        cookies à tout moment. Le paramétrage des cookies est susceptible de
        modifier les conditions de navigation sur le site internet, ainsi que
        les conditions d’accès à certains services, et d’entrainer des
        dysfonctionnements de certaines fonctionnalités.
      </Text>
      <Text>
        Pour plus d’informations sur les cookies et les moyens permettant
        d’empêcher leur installation, l’utilisateur peut se rendre sur la page
        dédiée sur le site internet de la CNIL :
        https://www.cnil.fr/fr/cookies-les-outils-pour-les-maitriser.
      </Text>

      <Title2 num="6">Usages non autorisés et sanctions</Title2>
      <Text>
        L’utilisateur ne doit pas utiliser le service dans un autre but que
        celui fixé à l’article 2 ou de façon contraire aux conditions générales
        d’utilisation.
      </Text>
      <Text>Les déclarations doivent être effectuées de bonne foi.</Text>
      <Text>
        Conformément à l’article L. 5426-1-1 du code du travail, les périodes
        d'activité professionnelle d'une durée supérieure à trois jours,
        consécutifs ou non, au cours du même mois civil, non déclarées par le
        demandeur d'emploi à Pôle emploi au terme de ce mois ne sont pas prises
        en compte pour l'ouverture ou le rechargement des droits à l'allocation
        d'assurance. Les rémunérations correspondant aux périodes non déclarées
        ne sont pas incluses dans le salaire de référence. Sans préjudice de
        l'exercice d'un recours gracieux ou contentieux par le demandeur
        d'emploi, lorsque l'application de ces dispositions fait obstacle à
        l'ouverture ou au rechargement des droits à l'allocation d'assurance, le
        demandeur d'emploi peut saisir l'instance paritaire de Pôle emploi
        mentionnée à l'article L. 5312-10 du code du travail.
      </Text>
      <Text>
        Est radiée de la liste des demandeurs d'emploi, dans des conditions
        déterminées par un décret en Conseil d'Etat, la personne qui a fait de
        fausses déclarations pour être ou demeurer inscrite sur cette liste,
        conformément à l’article L. 5412-2 du code du travail.
      </Text>
      <Text>
        De plus, le revenu de remplacement est supprimé par Pôle emploi en cas
        de fraude ou de fausse déclaration, conformément à l’article L. 5426-2
        du code du travail. Les sommes indûment perçues donnent lieu à
        remboursement.
      </Text>
      <Text>
        Enfin, le fait d'établir de fausses déclarations ou de fournir de
        fausses informations pour être ou demeurer inscrit sur la liste des
        demandeurs d'emploi mentionnée à l'article L. 5411-1 est puni des peines
        prévues à l'article 441-6 du code pénal, conformément à l’article L.
        5413-1 du code du travail.
      </Text>
      <Text>
        Sans préjudice des actions en récupération des allocations indûment
        versées et des poursuites pénales, l'inexactitude ou le caractère
        incomplet, lorsqu'ils sont délibérés, des déclarations faites pour le
        bénéfice des allocations d'aide aux travailleurs privés d'emploi ainsi
        que l'absence de déclaration d'un changement dans la situation
        justifiant ce bénéfice, ayant abouti à des versements indus, peuvent
        être sanctionnés par une pénalité prononcée par Pôle emploi . Le montant
        de la pénalité ne peut excéder 3 000 euros conformément à l’article L.
        5426-5 du code du travail.
      </Text>

      <Title2 num="7">Responsabilité</Title2>
      <Text>
        L’utilisateur ne peut prétendre à aucune indemnité en cas
        d’impossibilité d’accéder au service ou en cas de dommages de toute
        nature, directs ou indirects, résultant de l’utilisation du service.
      </Text>
      <Text>
        En cas d’indisponibilité de ZEN, vous devez effectuer les démarches
        d’actualisation sur la liste des demandeurs d’emploi et la fourniture
        des justificatifs sur pole-emploi.fr, sur l’application mobile ou auprès
        de votre agence, ou au téléphone (au 3949).
      </Text>

      <Title2 num="8">Propriété intellectuelle</Title2>
      <Text>
        Le service est protégé au titre du droit d’auteur défini aux articles
        L.111-1 et suivants du code de la propriété intellectuelle. Toute
        représentation, reproduction ou diffusion, intégrale ou partielle du
        service, sur quelque support que ce soit, sans l’autorisation expresse
        et préalable de Pôle emploi constitue un acte de contrefaçon, sanctionné
        au titre des articles L.335-2 et L.335-3 du même code, sans préjudice
        des dispositions de l’article L.122-5 du code de la propriété
        intellectuelle.
      </Text>
      <Text>
        Par ailleurs, toute représentation, reproduction ou diffusion, intégrale
        ou partielle de la marque Pôle emploi, sur quelque support que ce soit,
        sans l'autorisation expresse et préalable de Pôle emploi constitue un
        acte de contrefaçon, sanctionné au titre de l’article L.716-1 du même
        code.
      </Text>
    </div>
  )
}

Cgu.propTypes = {
  isLogin: PropTypes.bool.isRequired,
}

export default connect(
  (state) => ({ isLogin: !!state.userReducer.user }),
  {},
)(Cgu)
