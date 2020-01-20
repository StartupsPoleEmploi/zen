const DeclarationMonth = require('../models/DeclarationMonth')

/**
 * @desc get current month
 * @returns {Promise<DeclarationMonth | null>}
 */
async function getCurrentMonth() {
  return DeclarationMonth.query()
    .where('endDate', '>', new Date())
    .andWhere('startDate', '<=', 'now')
    .first(); 
}

module.exports = {
  getCurrentMonth,
}