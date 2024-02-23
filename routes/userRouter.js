const Router = require("express");
const router = new Router();
const userController = require("../controllers/userController");
const {
    registration,
    registrationAdmin,
    registrationSupper,
    registrationTeacher,
    updateLoginOne,
    userGet
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
// router.post("/registration", userController.registration);
router.post("/registration-supper", registrationSupper);
router.post("/registration", registrationAdmin);
router.post("/teacher-registration", registrationTeacher);
router.post("/login", userController.login);
router.get("/auth", authMiddleware, userController.check);
router.post("/delete", authMiddleware, userController.delete);
router.post("/put", authMiddleware, userController.update);
router.post("/login-update", authMiddleware, updateLoginOne);  // login and password updaet 
router.get("/get", authMiddleware, userGet);  // cobinat api 

module.exports = router;
