const ApiError = require("../error/ApiError");
const { GroupStudents, Groups, Students, Attendansi, AttendansiStudent, GroupSchedule } = require("../models/models");
const groupStudentCreate = require('./groupStudentCreate')
const groupStudentsExport = require('./groupStudentExport')
const validateFun = require("./validateFun");
const CountWeekdays = require("./countWeekdays");
const logSystemController = require("./logSystemController");
const { Op } = require("sequelize");

class groupStudentsController {
    async groupStudentsAdd(req, res, next) {
        try {
            const { student_id, group_id, summa, status } = req.body;

            if (!student_id || !validateFun.isValidUUID(student_id)) {
                return next(ApiError.badRequest("student idsi yo'q "));
            } else {
                const studentOne = await Students.findOne({
                    where: { id: student_id, status: "active" },
                });
                if (!studentOne) {
                    return next(ApiError.badRequest("Bunday o'quvchi topilmadi"));
                }
            }

            if (!group_id || !validateFun.isValidUUID(group_id)) {
                return next(ApiError.badRequest("group idsi yo'q "));
            } else {
                const groupOne = await Groups.findOne({
                    where: { id: group_id, status: "active" },
                });
                if (!groupOne) {
                    return next(ApiError.badRequest("Bunday group topilmadi"));
                }
            }

            const week_day = new Date().getDay();
            const lesson = await GroupSchedule.findOne({
                where: {
                    status: 'active',
                    group_id,
                    day_of_week: week_day
                }
            });



            const groups = await Groups.findOne({
                where: { status: "active", id: group_id },
            });
            let statusType = typeof status;
            if (statusType != "boolean") {
                return ApiError.badRequest("The status value was entered incorrectly")

            }
            const candidate = await GroupStudents.findOne({
                where: { status: "active", student_id },
            });
            if (candidate) {
                return next(ApiError.badRequest("This student already has another study group"));
            }
            if (!groups) {
                return next(ApiError.badRequest(`Group topilmadi`));
            }
            groups.count_students = String(Number(groups.count_students) + 1);
            const groupCount = await groups.save();
            const groupStudents = await GroupStudents.create({
                student_id,
                group_id,
                month_payment: summa ? summa : 0,
                status: status ? 'test' : 'active'

            });
            const day = new Date().getDate();
            const groupStudentCreateRes = status ? { test_student_add: true } : await groupStudentCreate({ student_id, group_id, day, summa });

            if (lesson) {
                const time = (new Date().getHours() <= 9 ? "0" : '') + '' + new Date().getHours() + ':'
                    + (new Date().getMinutes() <= 9 ? "0" : '') + '' + new Date().getMinutes() + ':' +
                    (new Date().getSeconds() <= 9 ? "0" : '') + new Date().getSeconds();

                const timeValidate = CountWeekdays.calculateAttendanceEndTime(lesson.lesson_time, time);
                if (timeValidate == 'truevalue') {
                    const year = new Date().getFullYear();
                    const month = new Date().getMonth() + 1;
                    const date = new Date().getDate();
                    const allDate = year + '-' + (month <= 9 ? '0' + month : month) + '-' + (date <= 9 ? '0' + date : date);
                    const attendansi = await Attendansi.findOne({
                        where: {
                            group_id,
                            date: allDate,
                            status: 'active',
                        },
                    });
                    if (attendansi) {
                        await AttendansiStudent.create({
                            student_id,
                            attendan_id: attendansi.id,
                            attendan_student_status: 'came',
                            comment: '',
                            group_id,
                            date: date,

                        });
                    }



                }

            }

            res.json({ groupStudents, groupCount, groupStudentCreateRes });
        } catch (error) {
            console.log(112, error.stack);
            return next(ApiError.badRequest(`${error} , groupStudents add`));
        }
    }
    async groupStudentsDelete(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            };
            const groupStudentsById = await GroupStudents.findOne({ where: { id } });
            if (!groupStudentsById) {
                return next(
                    ApiError.badRequest(`Ushbu ${id} idli malumotlar topilmadi`)
                );
            }
            groupStudentsById.status = "inactive";
            const groupStudentsDeletes = await groupStudentsById.save();
            if (!groupStudentsDeletes) {
                return next(
                    ApiError.badRequest(
                        `Ush bu ${id} id tegishli malumotlarni o'zgartirib bo'lmadi`
                    )
                );
            }
            res.json({ groupStudentsDeletes });
        } catch (error) {
            return next(ApiError.badRequest(`${error}, groupStudents delete`));
        }
    }
    async groupStudentsPut(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            };
            const { student_id, group_id } = req.body;

            const groupStudentsById = await GroupStudents.findOne({ where: { id } });

            if (!groupStudentsById) {
                return next(ApiError.badRequest(`Ushbu idli o'quvchi topilmadi`));
            }
            if (student_id && validateFun.isValidUUID(student_id)) groupStudentsById.student_id = student_id;
            if (group_id && validateFun.isValidUUID(group_id)) groupStudentsById.group_id = group_id;

            const groupStudentsUpdate = await groupStudentsById.save();
            if (!groupStudentsUpdate) {
                return next(
                    ApiError.badRequest(
                        `Ush bu ${id} id tegishli malumotlarni o'zgartirib bo'lmadi`
                    )
                );
            }
            res.json({ groupStudentsUpdate });
        } catch (error) {
            return next(ApiError.badRequest(`${error}, groupStudents put`));
        }
    }
    async groupStudentsPutSumma(req, res, next) {
        try {
            const { id, summa } = req.body;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            };
            const groupStudentsById = await GroupStudents.findOne({ where: { id } });

            if (!groupStudentsById) {
                return next(ApiError.badRequest(`Ushbu idli o'quvchi topilmadi`));
            };

            const student = await Students.findOne({
                where: {
                    id: groupStudentsById.student_id
                }
            });

            const group = await Groups.findOne({
                where: {
                    id: groupStudentsById.group_id
                }
            });

            if (summa) groupStudentsById.month_payment = summa;

            const text = `${student.firstname + " " + student.lastname}ni ${group.name} guruhidagi to'lov summasini o'zgartirildi.`;
            await logSystemController.logsAdd({ reqdata: req, text });

            const groupStudentsUpdate = await groupStudentsById.save();
            if (!groupStudentsUpdate) {
                return next(
                    ApiError.badRequest(
                        `Ush bu ${id} id tegishli malumotlarni o'zgartirib bo'lmadi`
                    )
                );
            }
            res.json({ groupStudentsUpdate });
        } catch (error) {
            console.log(218, error.stack);
            return next(ApiError.badRequest(`${error}, groupStudents put`));
        }
    }
    async groupStudentsGet(req, res, next) {
        try {
            const groupStudents = await GroupStudents.findAll({
                where: { status: "active" },
            });
            res.json(groupStudents);
        } catch (error) {
            return next(ApiError.badRequest(`${error}, groupStudents get`));
        }
    }
    async groupStudentsExportNewGroup(req, res, next) {
        try {
            const { exitGroup_id, newGroup_id, student_id, group_student_id, summa, } = req.body;

            if (!student_id || !validateFun.isValidUUID(student_id)) {
                return next(ApiError.badRequest("student_id not found "));
            } else {
                const studentOne = await Students.findOne({
                    where: { id: student_id, status: "active" },
                });
                if (!studentOne) {
                    return next(ApiError.badRequest("No such student found"));
                }
            }
            if (!exitGroup_id || !validateFun.isValidUUID(exitGroup_id)) {
                return next(ApiError.badRequest("exitGroup_id not found "));
            } else {
                const groupOne = await Groups.findOne({
                    where: { id: exitGroup_id, status: "active" },
                });
                if (!groupOne) {
                    return next(ApiError.badRequest("No such exporting group was found"));
                }
            }

            if (!group_student_id || !validateFun.isValidUUID(group_student_id)) {
                return next(ApiError.badRequest("group_student_id not found "));
            }

            const group_student_old = await GroupStudents.findOne({
                where: {
                    group_id: exitGroup_id,
                    student_id: student_id,
                    [Op.or]: [
                        { status: "active" },
                        { status: "frozen" }, // Replace 'another_status' with the second status you want to query
                        { status: "test" }, // Replace 'another_status' with the second status you want to query
                    ],
                }
            });

            if (!group_student_old) {
                return next(
                    ApiError.badRequest("Bu o'quvchi guruhdan topilmadi")
                )
            }

            if (group_student_id != group_student_old.id) {
                return next(
                    ApiError.badRequest("Bu o'quvchi guruhdan topilmadi")
                )
            }


            if (!newGroup_id || !validateFun.isValidUUID(newGroup_id)) {
                return next(ApiError.badRequest("newGroup_id not found "));
            } else {
                const groupOne = await Groups.findOne({
                    where: { id: newGroup_id, status: "active" },
                });
                if (!groupOne) {
                    return next(ApiError.badRequest("No such importing group was found"));
                }
            }

            const groupStudent = await GroupStudents.findOne({
                where: {
                    group_id: newGroup_id,
                    status: 'active',
                    student_id: student_id,
                }
            });

            if (groupStudent) {
                return next(
                    ApiError.badRequest("Bu o'quvchi ko'chirilishi kerak bo'lgan guruhda mavjud")
                )
            }

            if (summa < 0) {
                return next(ApiError.badRequest("Enter the correct value in the amount"));
            }
            const newGroupStudent = await GroupStudents.create({
                student_id,
                group_id: newGroup_id,
                month_payment: summa ? summa : 0

            });
            await groupStudentsExport({ exitGroup_id, newGroup_id, student_id, group_student_id, summa, newGroupStudent_id: newGroupStudent.id, req })



            return res.send('expor student')
        } catch (error) {
            return next(ApiError.badRequest(`${error}, groupStudents export`));
        }
    }
}

module.exports = new groupStudentsController();
