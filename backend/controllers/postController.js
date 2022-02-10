/* Importation des modules */
const models = require('../models')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const { nextTick } = require('process')

/* Importation des Tables de la BDD */
const User = models.User
const Post = models.Post
const reactionTable = models.LikePost
const Comment = models.Comment

/* --------------------------------- Fonctions C.R.U.D ------------------------------------*/

/* GET ALL POSTS (GET)
 */
exports.getAllPosts = (req, res) => {
  Post.findAll({
    include: [{ model: User, nested: true }, {model: Comment, include: [{model: User, nested: true}], nested: true}, {model: reactionTable, nested: true}]
  })
    .then(posts => {
      res.status(200).json({ posts })
    })
    .catch(err => {
      res.status(500).json({
        error: 'Problem with post getAll function or GET query' + err
      })
    })
}

/* GET ONE POSTS (GET)
 */
exports.getOnePost = (req, res) => {
  Post.findOne({
    where: {
      id: req.params.id
    },
    include: [{ all: true, nested: true }]
  })
    .then(post => {
      res.status(200).json({ post })
    })
    .catch(err => {
      res.json({
        error: 'Problem with post getOne function or GET query' + err
      })
    })
}

/*  - CREATE POST (POST)
Fonction de creation de 'Post' (publication) */
exports.createPost = (req, res) => {
  let newPost = {}
  if (req.file) {
    console.log('Post Create Request : File attached...')
    newPost = {
      ...req.body,
      postImageUrl: `${req.protocol}://${req.get('host')}/images/${
        req.file.filename
      }`
    }
  } else {
    console.log('Post Create Request : No file attached !')
    newPost = {
      ...req.body
    }
  }
  Post.create(newPost)
    .then(post =>
      res.status(200).json({ post })
    )
    .catch(err => {
      res
        .status(500)
        .json( { error: 'Problem with Post create function : ' + err })
    })
}

/* UPDATE POST (PUT)
Fonction de modification de 'Post' (publication) */
exports.updatePost = (req, res) => {
  postUpdated = {}
  if (req.file) {
    console.log('File attached...')
    postUpdated = {
      ...req.body,
      postImageUrl: `${req.protocol}://${req.get('host')}/images/${
        req.file.filename
      }`
    }
    /* Cherche l'objet initial dans la BDD pour effacer l'image 'lié' du dossier statique */
    const fileName = req.body.imageUrlPrev.split(
      '/images/'
    )[1] /* recupere le nom original du fichier image */
    fs.unlink('images/' + fileName, function () {}) /* Efface le fichier */
  } else {
    postUpdated = {
      ...req.body
    }
  }
  Post.update(
    {
      postImageUrl: postUpdated.postImageUrl,
      content: postUpdated.content
    },
    { where: { id: req.params.id } }
  )
    .then(post => res.status(200).json({ post }))
    .catch(err =>
      res.json({ error: 'Problem with posts UPDATE request' + err })
    )
}

/* DELETE POST (DELETE)
 */
exports.deletePost = (req, res) => {
  Post.destroy({ where: { id: req.params.id } })
    .then(result => res.status(200).json({ result }))
    .catch(err =>
      res.json({ error: 'Problem with posts DELETE request' + err })
    )
}

/* --------------------------------- Fonctions Supplémentaires ------------------------------------*/

exports.findByAuthor = (req, res) => {
  Post.findAll({
    where: {
      UserId: req.params.id
    },
    include: [{ all: true, nested: true }]
  })
    .then(posts => {
      res.status(200).json({ posts })
    })
    .catch(err => {
      res.json({
        error: 'Problem with Post findByAuthor : ' + err
      })
    })
}

/* LIKE OF DISLIKE POST
 Fonction qui gére les 'Like' et 'Dislike' */
exports.likeOrDislikePost = (req, res) => {
  console.log(req.body)
  const likeValue = req.body.value
  let alreadyReact = false
  /* Si la valeur de like 'value' est de 0 */
  if (likeValue == 0) {
    /* Cherche dans la table 'LikePosts' pour detruire le like ou dislike */
    reactionTable
      .findOne({
        where: { UserId: req.body.userId },
        include: [
          {
            model: Post,
            where: { id: req.body.postId }
          }
        ]
      })
      .then(result => {
        console.log(result.Post)
        if (result.value == 1) {
          console.log(result)
          result.Post.decrement('likeCounter')
        }
        else if (result.value == -1) {
          result.Post.decrement('dislikeCounter')
        }
        else {
          console.log('Value of object invalid (like or dislike')
        }
        reactionTable
      .destroy({
        where: { PostId: result.Post.id },
        include: [
          {
            model: User,
            where: { id: req.body.userId }
          }
        ]
      })
      .then(()=> res.status(200).json("Like or dislike deleted success ! ") )
      .catch(err => console.log(err))
      })
      .catch(err => console.log(err))
  } else {
    /* Dans les autres cas ( '1' ou '-1'), cherche dans la table 'LikePosts' une occurence */
    reactionTable
      .count({
        where: { postId: req.body.postId },
        include: [
          {
            model: User,
            where: { id: req.body.userId }
          }
        ]
      })
      .then(count => {
        /* Si une occurence est trouvé, modifie la variable 'alreadyReact' en "true". */
        if (count != 0) {
          alreadyReact = true
        }
      })
      .then(() => {
        /* Si aucune occurence est trouvé */
        if (alreadyReact === false) {
          /* Cherche le post correspondant a 'postId' via son ID */
          Post.findByPk(req.body.postId)
            .then(post => {
              if (likeValue > 0) {
                post.increment('likeCounter')
              }
              if (likeValue < 0) {
                post.increment('dislikeCounter')
              }
            })
            .then(() => {
              reactionTable
                .create({
                  UserId: req.body.userId,
                  PostId: req.body.postId,
                  value: req.body.value
                })
                .then(post => {
                  res.status(200).json({
                    message: 'Like successfully added to LikePosts table'
                  })
                })
                .catch(err => {
                  res.json({
                    error:
                      'Problem with posts POST request when findByPk in like section of likeOrDislikePost' +
                      err
                  })
                })
            })
            .catch(err => res.json({ error: 'Problem in findByPk ' + err }))
        }
      })
      .then(value => {
        if (alreadyReact === true && value != 0) {
            /* Cherche dans la table 'LikePosts' pour detruire le like ou dislike */
    reactionTable
    .findOne({
      where: { UserId: req.body.userId },
      include: [
        {
          model: Post,
          where: { id: req.body.postId }
        }
      ]
    })
    .then(result => {
      console.log(result.Post)
      if (result.value == 1) {
        console.log(result)
        result.Post.decrement('likeCounter')
      }
      else if (result.value == -1) {
        result.Post.decrement('dislikeCounter')
      }
      else {
        console.log('Value of object invalid (like or dislike')
      }
      reactionTable
    .destroy({
      where: { PostId: result.Post.id },
      include: [
        {
          model: User,
          where: { id: req.body.userId }
        }
      ]
    })
    .then(()=> res.status(200).json("Like or dislike deleted success ! ") )
    .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
        }
      })
      .catch(err =>
        res.json({ error: 'Problem with LikeorDislike Function ' + err })
      )
  }
}