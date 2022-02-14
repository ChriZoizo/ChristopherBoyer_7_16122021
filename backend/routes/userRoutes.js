/* Importation des modules */
const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

const auth = require('../middlewares/auth') /*  Authorize */

router.post('/signup', userController.signup) 
router.post('/login', userController.login) /* Login User Route 'login' en POST pour raison de securité (GET met en cache les données)  */

router.get('/', auth, userController.getAllUsers) /* GET get all users */
router.get('/:id', userController.getOneUser) /* GET one user */

router.put('/:id', auth, userController.updateUserProfil) /* PUT modify user */
router.delete('/:id', userController.deleteUser) /* DELETE delete user */


module.exports = router