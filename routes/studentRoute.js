const Router = require("express");
const router = new Router();
const {
  studentAdd,
  studentDelete,
  studentPut,
  studentGet,
  studentGetOne,
  studentGetList,
  studentGroupGetList,
  studentOneDelete,
  studentGetListSearch,
  studentAddFreeze,
  studentDeleteFreeze,
  studentDeleteNew
  // studentFreezeCron_1,
} = require("../controllers/studentsController");
const authMiddleware = require("../middleware/authMiddleware");
router.post("/add", authMiddleware, studentAdd);
router.post("/delete/:id", authMiddleware, studentDeleteNew);
router.post("/delete/one/:id", authMiddleware, studentOneDelete);
router.post("/put/:id", authMiddleware, studentPut);
router.post("/add-freeze", authMiddleware, studentAddFreeze);
router.post("/delete-freeze",authMiddleware,  studentDeleteFreeze);
router.get("/get", authMiddleware, studentGet);
router.get("/get/one/:id", authMiddleware, studentGetOne);
router.get("/list/get", authMiddleware, studentGetList);
router.get("/group/list/get/:group_id", authMiddleware, studentGroupGetList);
router.get("/list/get/search/", authMiddleware, studentGetListSearch);
// router.get("/cron-1", studentFreezeCron_1);

module.exports = router;
