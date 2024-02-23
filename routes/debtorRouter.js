const Router = require("express");
const router = new Router();
const {
    debtorAdd,
    debtorDelete,
    debtorGet,
    debtorPut,
    debtorAllGet,
    debtorDeleteOne,
    debtorAllGetNew,
    debtorNote
} = require("../controllers/debtorsController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, debtorAdd);
router.post("/delete", authMiddleware, debtorDelete);
router.post("/delete/one", authMiddleware, debtorDeleteOne);
// router.post("/put/:id", authMiddleware, debtorPut);
router.post("/get/:id", authMiddleware, debtorGet);
router.post("/add-note", authMiddleware, debtorNote);  // add note
// router.get("/all/get", authMiddleware, debtorAllGet);
router.get("/all/get", authMiddleware, debtorAllGet);
// router.get("/all/get",  debtorAllGetNew);

module.exports = router;
