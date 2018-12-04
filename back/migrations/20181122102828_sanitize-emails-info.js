exports.up = function(knex) {
  return knex
    .raw(
      'UPDATE "Declarations" SET "isEmailSent"=true WHERE "hasFinishedDeclaringEmployers"=true',
    )
    .then(() =>
      knex.raw(
        'UPDATE "Declarations" SET "isDocEmailSent"=true WHERE "isFinished"=true',
      ),
    )
}

exports.down = function() {}
