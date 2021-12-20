/* Importation des modules */
const express = require('express')
/* const { user } = require('../../../../P7_boyer_christopher/backend/config/db.config') */
const router = express.Router()
const userController = require('../controllers/userController')

router.get('/', userController.getAllUsers)
router.post('/signup', userController.signup)
router.post('/login', userController.login) /* Route 'login' en POST pour raison de securité (GET met en cache les données)  */
router.put('/:id', userController.updateUserProfil)

router.get('/find/:id', userController.getOneUser)
router.get('/findByEmail/:email', userController.findByEmail)
router.get('/findByName', userController.findByName)

module.exports = router