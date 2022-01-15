/* Importation des modules */
const express = require('express')
const router = express.Router()

const auth = require('../middlewares/auth')
const multer = require('../middlewares/multer-config')

const postController = require('../controllers/postController')

router.get('/', postController.getAllPosts)
router.get('/:id', postController.getOnePost)

router.post('/', multer, postController.createPost)
router.put('/:id', multer, postController.updatePost)

router.delete('/:id', postController.deletePost)

router.post('/:id/like', postController.likeOrDislikePost)
router.post('/:id/vote', postController.upvotePost)

module.exports = router