// This file exists only to suppress node-config warnings
// configuration is mainly done with docker .env files
// interpolated in default.json
module.exports = {

  // scops get from https://www-r.es-qvr-dev.fr/
  peConnectScope: [
    // API => Se connecter avec Pôle emploi - V1
    'api_peconnect-individuv1',
    `application_${process.env.CLIENT_OAUTH_ID}`,
    // 'qos_silver_peconnect-individuv1',
    'openid',
    'profile',
    'email',

    // API => Coordonnées v1
    'api_peconnect-coordonneesv1',
    // 'qos_gold_peconnect-coordonneesv1',
    'coordonnees',

    // API => Envoi document ZEN - V1
    'api_peconnect-envoidocumentv1',
    'document',
    'documentW',

    // API => Actualisation ZEN - V1
    'api_peconnect-actualisationv1',
    // 'qos_gold_peconnect-actualisationv1',
    'individu',
  ].join(' '),
};
