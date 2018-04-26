'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    peId: DataTypes.INTEGER,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING
  }, {});
  return User;
};
