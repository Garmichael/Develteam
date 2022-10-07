let squel = require('squel'),
    databaseQuery = require('../modules/module_mysqlQuery');

function logError(dbError, error, query, loggedUser) {
    let loggedUserId = loggedUser.isLoggedIn ? loggedUser.info.id : 0;

    let insertQuery = squel.insert()
        .into('errors')
        .set('dbError', escape(dbError.code))
        .set('error', escape(error))
        .set('loggedUserId', loggedUserId)
        .set('query', escape(query))
        .toString();

    databaseQuery(insertQuery, [], function (error, insertData) {
        console.log(error, insertData);
    });
}

module.exports = function (dbError, error, query, req, carriedLoggedUser) {
    if (carriedLoggedUser) {
        logError(dbError, error, query, carriedLoggedUser);
    } else {
        logError(dbError, error, query, {isLoggedIn: false});
    }
};