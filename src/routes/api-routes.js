let router = require('express').Router()

router.get('/', function (req, res) {
    console.log('ACBCBASKJSA')
    res.json({
        status: 'API Its Working',
        message: 'Welcome to SharingLibrary crafted with love!',
    });
});

var userController = require('../controllers/userController')
var bookController = require('../controllers/bookControllers')
var authMiddleware = require('../middlewares/auth-middleware')

router.route('/users')
    .get(authMiddleware.verifyJwt, userController.getAll)
    .post(userController.create);
router.route('/books')
    .get(bookController.getAll)
    .post(bookController.create)
router.get('/profile', authMiddleware.verifyJwt, userController.getProfile)
router.post('/login', userController.login)
// Export API routes
module.exports = router