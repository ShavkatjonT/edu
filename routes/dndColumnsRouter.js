const Router = require("express");
const router = new Router();
const {
   columsAdd,
   columsDelete,
   columsGet,
   columsPut,
   columsUpdateName,
   columnStartGruopLesson_1,
   columnStartGruopLesson_2,
   columnSendMessege
} = require("../controllers/dndColumnsController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, columsAdd);
router.post("/delete", authMiddleware, columsDelete);
router.post("/put-name", authMiddleware, columsUpdateName);
router.post("/group-launch-1", authMiddleware, columnStartGruopLesson_1);
router.post("/group-launch-2", authMiddleware, columnStartGruopLesson_2);
router.post("/put", authMiddleware, columsPut);
router.post("/send-message", authMiddleware, columnSendMessege);
router.get("/get", authMiddleware, columsGet);

module.exports = router;