const Router = require("express");
const router = new Router();
const {
   logsGet,
   logsFilter
} = require("../controllers/logSystemController");
const authMiddleware = require("../middleware/authMiddleware");

// router.get("/all",authMiddleware,   logsGet);
router.get("/all", authMiddleware, logsGet);
router.post("/log-filter", authMiddleware, logsFilter);


module.exports = router;
