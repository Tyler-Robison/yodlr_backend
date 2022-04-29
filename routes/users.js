var express = require('express');
var router = express.Router();
var _ = require('lodash');
var logger = require('../lib/logger');
var log = logger();

var users = require('../init_data.json').data;
var fs = require('fs')

/* GET users listing. */
router.get('/', function (req, res) {
  res.json(_.toArray(users));
});

/* Create a new user */
router.post('/', function (req, res) {
  var curId = _.size(users);
  var user = req.body;
  user.id = curId + 1;

  if (!user.state) user.state = 'pending';

  users[user.id] = user;

  // replaces init_data.json with JSON that contains new user
  // Allows created users to persist across server restarts
  const newBody = JSON.stringify({ 'data': users })
  fs.writeFile('./init_data.json', newBody, (err) => {
    console.log('error: ', err)
  })

  log.info('Created user', user);
  res.json(user);
});

/* Get a specific user by id */
router.get('/:id', function (req, res, next) {
  var user = users[req.params.id];
  if (!user) {
    return next();
  }
  res.json(users[req.params.id]);
});

/* Delete a user by id */
router.delete('/:id', function (req, res) {
  var user = users[req.params.id]
  delete users[req.params.id];
  res.status(204);
  log.info('Deleted user', user);
  res.json(user);
});

/* Update a user by id */
router.put('/:id', function (req, res, next) {
  var user = req.body;
  if (user.id != req.params.id) {
    return next(new Error('ID paramter does not match body'));
  }
  users[user.id] = user;
  log.info('Updating user', user);
  res.json(user);
});


module.exports = router;
