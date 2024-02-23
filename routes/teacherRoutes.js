const Router = require("express");
const router = new Router();
const {
    teacherAdd,
    teacherDelete,
    teacherGet,
    teacherPut,
    teacherLabelGet,
    teacherGetOne,
    teacherAllListGet,
    teacherAddPaymet,
    teacherAllListLoginGet,
    teacherAllListCabinet,
    employeeAdd,
    employeeAllListGet,
    employeeDelete,
    employeePut,
    employeePut_2,
    employeeListGet
} = require("../controllers/TeacherController");
const authMiddleware = require("../middleware/authMiddleware");
const {
    employeeNoteAdd,
    employeeNoteDelete,
    employeeNotePut,
    employeeNoteGet
} = require("../controllers/EmployeeNotesController");


const {
    teachersList
} = require("../controllers/teacherStatisticsCon");


router.post("/employee-add", authMiddleware, employeeAdd);  // employee
router.post("/add", authMiddleware, teacherAdd);
router.post("/delete/:id", authMiddleware, teacherDelete);
router.post("/employee-delete/:id", authMiddleware, employeeDelete); // employee
router.post("/put/:id", authMiddleware, teacherPut);
router.post("/employee-put/:id", authMiddleware, employeePut); // employee
router.post("/cabinet-data-update", authMiddleware, employeePut_2); // cabinet data update new api  
router.post("/payment/:id", authMiddleware, teacherAddPaymet);
router.get("/get", authMiddleware, teacherGet);
router.get("/label/get", authMiddleware, teacherLabelGet);
router.get("/all/list/get", authMiddleware, teacherAllListGet);
router.get("/employee-all/list", authMiddleware, employeeAllListGet); // employee
router.get("/all/login/list/get", authMiddleware, teacherAllListLoginGet);
router.get("/all/cabinet/list/get", authMiddleware, teacherAllListCabinet);
router.get("/get/one/:id", authMiddleware, teacherGetOne);
router.get("/employees-list", authMiddleware, employeeListGet); // employee log filter api

//=======================================================
router.post("/teacher-statistics", authMiddleware, teachersList); 

//=======================================================


// notes
// router.post("/employee-note/add", authMiddleware, employeeNoteAdd);
// router.post("/employee-note/delete", authMiddleware, employeeNoteDelete);
// router.post("/employee-note/put", authMiddleware, employeeNotePut);
// router.get("/employee-note-get/:id", authMiddleware, employeeNoteGet);

module.exports = router;
