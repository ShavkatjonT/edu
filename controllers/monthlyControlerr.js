const ApiError = require("../error/ApiError");
const { Monthly, Teachers } = require("../models/models");
const validateFun = require("./validateFun");
const logSystemController = require("./logSystemController");

class monthlyController {
    async monthlyDelete(req, res, next) {
        try {
            const { id } = req.body;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            };
            const monthly = await Monthly.findOne({
                where: {
                    id,
                    status: "active",
                },
            });

            if (!monthly) {
                return next(ApiError.badRequest("no data found"));
            }

            const teacher = await Teachers.findOne({
                where: {
                    id: monthly.teacher_id,
                    status: "active",
                },
            });

            teacher.wallet = (teacher.wallet ? teacher.wallet : 0) + monthly.payment;

            const teacherSave = teacher.save();
            monthly.status = "inactive";
            const monthlySave = monthly.save();

            const text = `${teacher?.lastname ? teacher?.lastname : ''} ${teacher?.firstname ? teacher?.firstname : ''} ismli xodimga ${monthly.month} oyga berilgan oylik maosh bo'yicha hisobot o'chirib yuborildi.`;
            await logSystemController.logsAdd({ reqdata: req, text });

            res.json({ teacherSave, monthlySave });
        } catch (error) {
            console.log(44, error.stack);
            return next(ApiError.badRequest(`${error}, monthly delete`));
        }
    }
    async monthlyPut(req, res, next) {
        try {
            const { id, sum, date } = req.body;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            };
            const monthly = await Monthly.findOne({
                where: {
                    id,
                    status: "active",
                },
            });

            if (!monthly) {
                return next(ApiError.badRequest("no data found"));
            }

            const teacher = await Teachers.findOne({
                where: {
                    id: monthly.teacher_id,
                    status: "active",
                },
            });

            teacher.wallet = (teacher.wallet ? teacher.wallet : 0) + monthly.payment;
            teacher.save();

            if (sum) {
                monthly.payment = sum;
            }

            if (date) {
                monthly.month = date;
            }

            const text = `${teacher?.lastname ? teacher?.lastname : ''} ${teacher?.firstname ? teacher?.firstname : ''} ismli xodimga ${monthly.month} oyga berilgan oylik maosh bo'yicha hisobot o'zgartirildi.`;
            await logSystemController.logsAdd({ reqdata: req, text });

            teacher.wallet = (teacher.wallet ? teacher.wallet : 0) - sum;
            const teacherSave = teacher.save();
            const monthlySave = monthly.save();

            res.json({ teacherSave, monthlySave });
        } catch (error) {
            return next(ApiError.badRequest(`${error}, monthly put`));
        }
    }
    async monthlyGet(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            };
            const date = new Date();

            const monthly = await Monthly.findAll({
                where: { status: "active", teacher_id: id },
            });

            const data =
                monthly &&
                monthly.map((e) => {
                    const dataOne = {
                        id: e.id,
                        month: e.month,
                        payment: e.payment,
                        deleteActive:
                            Math.trunc((date - e.createdAt) / 3600000) <= 24 ? true : false,
                        createdAt: e.createdAt,
                        updatedAt: e.updatedAt,
                    };
                    return dataOne;
                });

            const monthlySort =
                data &&
                data.sort(function (a, b) {
                    return b.createdAt - a.createdAt;
                });
            res.json(monthlySort);
        } catch (error) {
            return next(ApiError.badRequest(`${error}, monthly get`));
        }
    }
}

module.exports = new monthlyController();
