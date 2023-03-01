const express = require('express');
const controller = require('../controllers/postion')
const passport = require("passport");
const router = express.Router();


router.get('/:categoryId',passport.authenticate('jwt', {session: false}), controller.getByCategory)

router.post('/',passport.authenticate('jwt', {session: false}), controller.create)

router.patch('/:id',passport.authenticate('jwt', {session: false}), controller.update)

router.delete('/:id',passport.authenticate('jwt', {session: false}), controller.remove)


module.exports = router;