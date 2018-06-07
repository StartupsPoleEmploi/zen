// TODO use this to add tests for base app.js

module.exports = () => (req, res, next) => {
  req.session = {
    user: {
      id: 1,
      firstName: 'Hugo',
      lastName: 'Agbonon',
      peId: 'abcde12345',
    },
  }

  next()
}
