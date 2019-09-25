const JUNE_2019_MONTH_ID = 14

exports.up = function(knex, Promise) {
  return knex.transaction((trx) =>
    trx
      .raw(
        `UPDATE declarations SET "isFinished"=true WHERE "monthId" <= ${JUNE_2019_MONTH_ID} AND "hasFinishedDeclaringEmployers"=true`,
      )
      .then(() =>
        trx
          .raw(
            `UPDATE employer_documents SET "isTransmitted"=true WHERE "employerId" IN (
              SELECT id from employers WHERE "declarationId" IN (
                SELECT id from declarations WHERE "monthId" <= ${JUNE_2019_MONTH_ID} AND "hasFinishedDeclaringEmployers"=true
              )
            )`,
          )
          .then(() =>
            trx.raw(`UPDATE declaration_infos SET "isTransmitted"=true WHERE "declarationId" IN (
              SELECT id from "declarations" WHERE "monthId" <= ${JUNE_2019_MONTH_ID} AND "hasFinishedDeclaringEmployers"=true
            )`),
          ),
      ),
  )
}

exports.down = function(knex, Promise) {
  return Promise.resolve()
}
