const { format } = require('date-fns');

const ActivityLog = require('../models/ActivityLog');

const DATA_EXPORT_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'postalCode',
  'gender',
  'isAuthorized',
  'peId',
  'agencyCode',
  'situationRegardEmploiId',
  'registeredAt',
];

const getDeclaration = (declarations, monthId) =>
  declarations.find((d) => d.declarationMonth.id === monthId);

const getValidateFileActivityLog = (logs, { id: declarationId }) =>
  logs.find(
    (log) =>
      log.action === ActivityLog.actions.VALIDATE_FILES
      && log.metadata
      && log.metadata.declarationId === declarationId,
  );

const computeFields = (declarationMonths) => {
  const months = [];
  declarationMonths.forEach((month) => {
    const label = format(new Date(month.month), 'MM/YYYY');
    months.push({
      label: `${label} - Actu envoyee`,
      value: (row, field) => {
        if (row.declarations) {
          const declaration = getDeclaration(row.declarations, month.id);

          if (declaration) return format(declaration.transmittedAt, 'DD/MM');
        }
        return field.default;
      },
      default: '',
    });
    months.push({
      label: `${label} - Actu et doc envoyee`,
      value: (row, field) => {
        if (row.declarations) {
          const declaration = getDeclaration(row.declarations, month.id);

          if (declaration) {
            if (!declaration.hasWorked) return 'Pas travaille';
            if (declaration.isFinished) {
              if (row.activityLogs) {
                const log = getValidateFileActivityLog(
                  row.activityLogs,
                  declaration,
                );
                if (log) return format(log.createdAt, 'DD/MM');
              }
              // During 2 months we got a regression resulting in no VALIDATE_FILES activityLog...
              // We use declaration.updatedAt as fallback
              return format(declaration.updatedAt, 'DD/MM');
            }
          }
        }
        return field.default;
      },
      default: '',
    });
  });

  return [
    'firstName',
    'lastName',
    'email',
    'postalCode',
    'gender',
    'isAuthorized',
    'peId',
    ...months,
  ];
};

module.exports = {
  computeFields,
  DATA_EXPORT_FIELDS,
};
