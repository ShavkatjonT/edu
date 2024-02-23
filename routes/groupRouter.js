const Router = require("express");
const router = new Router();
const {
    groupAdd,
    groupDelete,
    groupGet,
    groupPut,
    groupGetOne,
    groupTeacherGet,
    groupLesson,
    groupLessonPut,
    groupAttendansi,
    groupAttendansiUpdate,
    groupAttendansiGet,
    groupAttendansiAllData,
    groupAttendansiOneCron,
    groupGetOneLesson,
    groupGetNew,
} = require("../controllers/groupsController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, groupAdd);
router.post("/lesson-add", authMiddleware, groupLesson);
router.post("/delete/:id", authMiddleware, groupDelete);
router.post("/put/:id", authMiddleware, groupPut);
router.post("/lesson-put/:id", authMiddleware, groupLessonPut);
router.post("/attendansi", authMiddleware, groupAttendansi);
router.get("/attendansi-cron", authMiddleware, groupAttendansiOneCron); ////////////////
router.post("/attendansi-get", authMiddleware, groupAttendansiGet);
router.post("/attendansi-all-data", authMiddleware, groupAttendansiAllData);
// router.post("/attendansi-all-data", groupAttendansiAllData);
router.post("/in-lesson", groupGetOneLesson);
router.post("/attendansi-update", authMiddleware, groupAttendansiUpdate);
router.get("/get/:id", authMiddleware, groupGet);
router.get("/teacher-groups/get", authMiddleware, groupTeacherGet);
router.get("/get/one/:id", authMiddleware, groupGetOne);

module.exports = router;
