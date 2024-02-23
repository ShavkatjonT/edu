const Router = require("express");
const router = new Router();
const {
    paymentDelete,
    paymentGet,
    paymentAdd,
    paymentPut,
    paymentExcelData,
    paymentChartGet,
    paymentGetNew,
    paymentGetNew_2,
    paymentChartType
} = require("../controllers/paymentsController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, paymentAdd);
router.post("/delete", authMiddleware, paymentDelete);
router.post("/put", authMiddleware, paymentPut);
router.post("/excel/list", authMiddleware, paymentExcelData);
router.get("/chart/list", authMiddleware, paymentChartGet);
// router.get("/get", authMiddleware, paymentGet);
// router.get("/get-1",  paymentGet);
router.post("/data", authMiddleware, paymentGetNew_2); // yanig to'lovalr olish uchun api
router.post("/chart/py-type/list", authMiddleware, paymentChartType); //new chart payment types
module.exports = router;
