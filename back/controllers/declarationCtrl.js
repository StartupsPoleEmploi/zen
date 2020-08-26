const {
  isBoolean, isInteger, isNumber, isString,
} = require('lodash');

const Declaration = require('../models/Declaration');

function $getSanitizedEmployer({ employer, declaration, userId }) {
  const workHours = parseFloat(employer.workHours);
  const salary = parseFloat(employer.salary);

  return {
    ...employer,
    userId,
    declarationId: declaration.id,
    // Save temp data as much as possible
    workHours: !Number.isNaN(workHours) ? workHours : null,
    salary: !Number.isNaN(salary) ? salary : null,
  };
}

/**
 * @param {object} declaration
 * @param {number} userId
 * @param {object[]} updatedEmployers
 * @param {object[]} newEmployers
 * @returns {Promise<void>}
 */
async function updateDeclartionDeep({
  declaration, userId, updatedEmployers, newEmployers,
}) {
  declaration.employers = [...newEmployers, ...updatedEmployers].map(
    (employer) => $getSanitizedEmployer({ employer, userId, declaration }),
  );
  const testEmployers = declaration.employers.some(
    (employer) =>
      !isString(employer.employerName)
      || employer.employerName.length === 0
      || !isInteger(employer.workHours)
      || !isNumber(employer.salary)
      || !isBoolean(employer.hasEndedThisMonth),
  );
  if (testEmployers) {
    const error = new Error('Invalid employers declaration');
    error.status = 400;
    throw error;
  }

  return Declaration.transaction(async (trx) => {
    const res = await Declaration.query(trx).upsertGraphAndFetch(declaration);
    return res;
  });
}

module.exports = {
  updateDeclartionDeep,
};
