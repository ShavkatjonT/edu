const ApiError = require("../error/ApiError");
const {
    Students,
    Groups,
    GroupStudents,
    Debtors,
    Payments,
    Sciences,
    DTMColumns,
    LessonGroup,
    FreezeStudents,
    Attendansi,
    AttendansiStudent,
    GroupSchedule,
    TeacherGroups,
    Teachers,
    PaymentTypes,
    TeacherStatistics
} = require("../models/models");
const sequelize = require("../db");
const { Op } = require("sequelize");
const CountWeekdays = require("./countWeekdays");
const sendMessage = require("./sendMessageController");
const validateFun = require("./validateFun");
const logSystemController = require("./logSystemController");

function removeDuplicateNames(arr) {
    if (!Array.isArray(arr)) {
        throw new Error("Input is not an array.");
    }

    const uniqueNames = {};
    const result = [];

    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];

        // Skip null or non-object elements
        if (!item || typeof item !== "object") {
            continue;
        }

        const name = item.name;

        // Add the item to the result array if its name is not encountered before
        if (!uniqueNames[name]) {
            uniqueNames[name] = true;
            result.push(item);
        }
    }

    return result;
}
class StudentController {
    async studentAdd(req, res, next) {
        try {
            const {
                firstname,
                gender,
                birthday,
                lastname,
                fathername,
                address,
                fatherPhone,
                motherPhone,
                studentPendingId,
                sciences,
                classStudentdent,
                group_id,

            } = req.body;

            if (sciences) {
                if (sciences.length > 5)
                    return next(ApiError.badRequest("Fan malumolarni o'zgartiring"));
            }

            if (!group_id || !validateFun.isValidUUID(group_id)) {
                return next(ApiError.badRequest("Data is incomplete"));
            }

            const group = await Groups.findOne({
                where: {
                    status: "active",
                    id: group_id,
                },
            });

            if (!group) {
                return next(ApiError.badRequest("No data found"));
            }

            const dtmcolumns =
                sciences &&
                (await DTMColumns.create({
                    name: "DTM Fanlar",
                    items: sciences,
                    order: 1,
                }));

            let student;
            if (studentPendingId) {

                if (!validateFun.isValidUUID(studentPendingId)) {
                    return next(ApiError.badRequest("The data was entered incorrectly"));
                } else {
                    student = await Students.findOne({ where: { id: studentPendingId } });
                    if (!student) {
                        return next(ApiError.badRequest("Bunday o'quvchi topilmadi"));
                    }
                    const group_student = await GroupStudents.findOne({
                        where: {
                            status: 'active',
                            student_id: studentPendingId
                        }
                    });
                    if (group_student) {
                        return next(ApiError.badRequest("This student already has another study group"));
                    };

                    student.status = "active";
                    const data = [
                        {
                            text: `Farzandingiz ${student.firstname + " " + student.lastname} ${group.name
                                } guruhiga qo'shildi. Vim`,
                            phone: student.fatherPhone
                                ? student.fatherPhone
                                : student.motherPhone,
                        },
                    ];
                    const messageResult = sendMessage(data);
                    const text = `${student.firstname + " " + student.lastname}ni ${group.name} guruhiga qo'shidi`;
                    await logSystemController.logsAdd({ reqdata: req, text });
                    const studentOne = await student.save();
                    return res.json({ studentOne });
                }

            } else if (
                firstname &&
                gender &&
                birthday &&
                lastname &&
                address &&
                fatherPhone
            ) {
                student = await Students.create({
                    firstname: firstname,
                    gender: gender,
                    birthday: birthday,
                    lastname: lastname,
                    fathername: fathername,
                    address: address,
                    fatherPhone: fatherPhone,
                    motherPhone: motherPhone,
                    science: sciences,
                    class: classStudentdent,
                    dtmcolumns_id: dtmcolumns && dtmcolumns.id,
                });

                const data = [
                    {
                        text: `Farzandingiz ${student.firstname + " " + student.lastname} ${group.name
                            } guruhiga qo'shildi. Vim`,
                        phone: student.fatherPhone
                            ? student.fatherPhone
                            : student.motherPhone,
                    },
                ];

                const text = `${student.firstname + " " + student.lastname}ni ${group.name} guruhiga qo'shidi`;
                await logSystemController.logsAdd({ reqdata: req, text });

                const messageResult = sendMessage(data);
                return res.json({ student, dtmcolumns });
            } else {
                return next(ApiError.badRequest("Data is incomplete"));
            }
        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }

    async studentDelete(req, res, next) {
        try {
            const { id } = req.params;
            if (!validateFun.isValidUUID(id)) {
                return next(ApiError.badRequest("The data was entered incorrectly"));
            }
            const { group_id } = req.body;

            if (!validateFun.isValidUUID(id)) {
                return next(ApiError.badRequest("You entered the data incorrectly"));
            }
            if (!group_id && !validateFun.isValidUUID(group_id)) {
                return next(ApiError.badRequest("You entered the data incorrectly"));
            }

            const findPersonById = await Students.findOne({ where: { id } });
            const groups = await Groups.findOne({
                where: { status: "active", id: group_id },
            });
            const groupStudentDelete = await GroupStudents.update(
                { status: "inactive" },
                {
                    where: {
                        [Op.or]: [
                            { status: "active" },
                            { status: "frozen" }, // Replace 'another_status' with the second status you want to query
                            { status: "test" }, // Replace 'another_status' with the second status you want to query
                        ],
                        student_id: id,
                        group_id: group_id,
                    },
                }
            );
            if (!findPersonById) {
                return next(
                    ApiError.badRequest(`Ushbu ${id} idli malumotlar topilmadi`)
                );
            }
            if (!groupStudentDelete) {
                return next(
                    ApiError.badRequest("student id yoki group id yuborilmadi")
                );
            }

            const freeze_studentsOne = groupStudentDelete?.id && await FreezeStudents.findOne({
                where: {
                    status: "active",
                    student_id: id,
                    group_id,
                    group_student_id: groupStudentDelete.id,
                },
            });

            const group = await Groups.findOne({
                where: {
                    status: "active",
                    id: group_id,
                },
            });

            const data = [
                {
                    text: `Farzandingiz ${findPersonById.firstname + " " + findPersonById.lastname
                        } ${group.name} guruhidan  chetlashtirildi. Vim`,
                    phone: findPersonById.fatherPhone
                        ? findPersonById.fatherPhone
                        : findPersonById.motherPhone,
                },
            ];
            const monthOne = new Date().getMonth() + 1;
            const year = new Date().getFullYear();
            const currentMonth =
                new Date().getFullYear() +
                "-" +
                (monthOne <= 9 ? "0" : "") +
                "" +
                monthOne;
            const debtors = await Debtors.findOne({
                where: {
                    status: "active",
                    group_id,
                    student_id: id,
                    month: currentMonth,
                },
            });

            const lessonGroupOne = await LessonGroup.findOne({
                where: {
                    group_id,
                    status: "active",
                },
            });

            const weekDay =
                lessonGroupOne &&
                lessonGroupOne.lesson_day.split(",").map((e) => Number(e));

            if (debtors) {
                const startTimeWeek = new Date(debtors.createdAt).getDay();
                const endTimeWeek =
                    freeze_studentsOne &&
                    new Date(freeze_studentsOne.start_date).getDay();
                const startGroupSchedule = await GroupSchedule.findOne({
                    where: {
                        group_id,
                        status: "active",
                        day_of_week: startTimeWeek,
                    },
                });

                const endData = await GroupSchedule.findOne({
                    where: {
                        group_id,
                        status: "active",
                        day_of_week: new Date(debtors.createdAt).getDay(),
                    },
                });

                const endGroupSchedule =
                    freeze_studentsOne &&
                    endTimeWeek &&
                    (await GroupSchedule.findOne({
                        where: {
                            group_id,
                            status: "active",
                            day_of_week: endTimeWeek,
                        },
                    }));

                const date = new Date(debtors.createdAt).getDate();
                const lessonDay = CountWeekdays.countWeekdaysInMonth(
                    monthOne,
                    year,
                    weekDay
                );
                const start_time_1 = (new Date(debtors.createdAt).getHours() <= 9 ? "0" : '') + '' + new Date(debtors.createdAt).getHours() + ':'
                    + (new Date(debtors.createdAt).getMinutes() <= 9 ? "0" : '') + '' + new Date(debtors.createdAt).getMinutes() + ':' +
                    (new Date(debtors.createdAt).getSeconds() <= 9 ? "0" : '') + new Date(debtors.createdAt).getSeconds();
                const end_time = validateFun.isLocatonTime().split(" ")[1];

                const lessonLastDay = !freeze_studentsOne
                    ? CountWeekdays.countWeekdaysInRangeNew({
                        week_day: weekDay,
                        start_date: debtors.createdAt,
                        start_time_1,
                        start_time_2: startGroupSchedule
                            ? startGroupSchedule.lesson_time
                            : false,
                        end_date: validateFun.isLocatonTime(),
                        end_time_1: end_time,
                        end_time_2: endData
                            ? endData.lesson_time
                            : false,
                    })
                    : CountWeekdays.countWeekdaysInRangeNew({
                        start_date: debtors.createdAt,
                        end_date: freeze_studentsOne.start_date,
                        start_time_1: start_time_1,
                        end_time_1: freeze_studentsOne.start_time,
                        start_time_2: startGroupSchedule
                            ? startGroupSchedule.lesson_time
                            : false,
                        end_time_2: endGroupSchedule
                            ? endGroupSchedule.lesson_time
                            : false,
                        week_day: weekDay,
                    });
                const amountSum = Math.trunc(
                    (lessonLastDay * debtors.all_summa) / lessonDay
                );
                const paySumm = debtors.all_summa - debtors.amount - amountSum;
                if (paySumm >= 0) {
                    debtors.status = "inactive";
                } else if (paySumm < 0) {
                    debtors.amount = Math.abs(paySumm);
                }
                await debtors.save();
            }

            groups.count_students = String(Number(groups.count_students) - 1);
            const groupCount = await groups.save();

            const group_student = await GroupStudents.findAll({
                where: {
                    status: "active",
                    student_id: id,
                },
            });
            if (group_student.length == 0) {
                findPersonById.status = "pending";
            };

            const teacherGroup = await TeacherGroups.findOne({
                where: {
                    status: 'active',
                    group_id: group_id
                }
            });
            const teacher = teacherGroup && await Teachers.findOne({
                where: {
                    status: 'active',
                    id: teacherGroup.teacher_id
                }
            });

            await TeacherStatistics.create({
                group_id: group_id,
                student_id: id,
                student_status: 'delete',
                student_count: groups.count_students,
                teacher_id: teacher ? teacher.id : ''
            });

            const studentSave = await findPersonById.save();
            await sendMessage(data);

            res.json({ groupStudentDelete, groupCount, studentSave });
        } catch (error) {
            console.log(273, error.stack);
            return next(ApiError.badRequest(error));
        }
    }

    async studentDeleteNew(req, res, next) {
        try {
            const { id } = req.params;
            if (!validateFun.isValidUUID(id)) {
                return next(ApiError.badRequest("The data was entered incorrectly"));
            }
            const { group_id, del_status } = req.body;

            if (!validateFun.isValidUUID(id)) {
                return next(ApiError.badRequest("You entered the data incorrectly"));
            }
            if (!group_id && !validateFun.isValidUUID(group_id)) {
                return next(ApiError.badRequest("You entered the data incorrectly"));
            }

            const findPersonById = await Students.findOne({ where: { id } });
            const groups = await Groups.findOne({
                where: { status: "active", id: group_id },
            });
            const groupStudentDelete = await GroupStudents.update(
                { status: "inactive" },
                {
                    where: {
                        [Op.or]: [
                            { status: "active" },
                            { status: "frozen" }, // Replace 'another_status' with the second status you want to query
                            { status: "test" }, // Replace 'another_status' with the second status you want to query
                        ],
                        student_id: id,
                        group_id: group_id,
                    },
                }
            );
            if (!findPersonById) {
                return next(
                    ApiError.badRequest(`Ushbu ${id} idli malumotlar topilmadi`)
                );
            }
            if (!groupStudentDelete) {
                return next(
                    ApiError.badRequest("student id yoki group id yuborilmadi")
                );
            }

            const freeze_studentsOne = groupStudentDelete?.id && await FreezeStudents.findOne({
                where: {
                    status: "active",
                    student_id: id,
                    group_id,
                    group_student_id: groupStudentDelete.id,
                },
            });

            const group = await Groups.findOne({
                where: {
                    status: "active",
                    id: group_id,
                },
            });

            const data = [
                {
                    text: `Farzandingiz ${findPersonById.firstname + " " + findPersonById.lastname
                        } ${group.name} guruhidan  chetlashtirildi. Vim`,
                    phone: findPersonById.fatherPhone
                        ? findPersonById.fatherPhone
                        : findPersonById.motherPhone,
                },
            ];
            const monthOne = new Date().getMonth() + 1;
            const year = new Date().getFullYear();
            const currentMonth =
                new Date().getFullYear() +
                "-" +
                (monthOne <= 9 ? "0" : "") +
                "" +
                monthOne;
            const debtors = await Debtors.findOne({
                where: {
                    status: "active",
                    group_id,
                    student_id: id,
                    month: currentMonth,
                },
            });

            const lessonGroupOne = await LessonGroup.findOne({
                where: {
                    group_id,
                    status: "active",
                },
            });

            const weekDay =
                lessonGroupOne &&
                lessonGroupOne.lesson_day.split(",").map((e) => Number(e));

            if (debtors) {
                const startTimeWeek = new Date(debtors.createdAt).getDay();
                const endTimeWeek =
                    freeze_studentsOne &&
                    new Date(freeze_studentsOne.start_date).getDay();
                const startGroupSchedule = await GroupSchedule.findOne({
                    where: {
                        group_id,
                        status: "active",
                        day_of_week: startTimeWeek,
                    },
                });

                const endData = await GroupSchedule.findOne({
                    where: {
                        group_id,
                        status: "active",
                        day_of_week: new Date(debtors.createdAt).getDay(),
                    },
                });

                const endGroupSchedule =
                    freeze_studentsOne &&
                    endTimeWeek &&
                    (await GroupSchedule.findOne({
                        where: {
                            group_id,
                            status: "active",
                            day_of_week: endTimeWeek,
                        },
                    }));

                const date = new Date(debtors.createdAt).getDate();
                const lessonDay = CountWeekdays.countWeekdaysInMonth(
                    monthOne,
                    year,
                    weekDay
                );
                const start_time_1 = (new Date(debtors.createdAt).getHours() <= 9 ? "0" : '') + '' + new Date(debtors.createdAt).getHours() + ':'
                    + (new Date(debtors.createdAt).getMinutes() <= 9 ? "0" : '') + '' + new Date(debtors.createdAt).getMinutes() + ':' +
                    (new Date(debtors.createdAt).getSeconds() <= 9 ? "0" : '') + new Date(debtors.createdAt).getSeconds();
                const end_time = validateFun.isLocatonTime().split(" ")[1];

                const lessonLastDay = !freeze_studentsOne
                    ? CountWeekdays.countWeekdaysInRangeNew({
                        week_day: weekDay,
                        start_date: debtors.createdAt,
                        start_time_1,
                        start_time_2: startGroupSchedule
                            ? startGroupSchedule.lesson_time
                            : false,
                        end_date: validateFun.isLocatonTime(),
                        end_time_1: end_time,
                        end_time_2: endData
                            ? endData.lesson_time
                            : false,
                    })
                    : CountWeekdays.countWeekdaysInRangeNew({
                        start_date: debtors.createdAt,
                        end_date: freeze_studentsOne.start_date,
                        start_time_1: start_time_1,
                        end_time_1: freeze_studentsOne.start_time,
                        start_time_2: startGroupSchedule
                            ? startGroupSchedule.lesson_time
                            : false,
                        end_time_2: endGroupSchedule
                            ? endGroupSchedule.lesson_time
                            : false,
                        week_day: weekDay,
                    });
                const amountSum = Math.trunc(
                    (lessonLastDay * debtors.all_summa) / lessonDay
                );
                const paySumm = debtors.all_summa - debtors.amount - amountSum;
                if (paySumm >= 0) {
                    debtors.status = "inactive";
                } else if (paySumm < 0) {
                    debtors.amount = Math.abs(paySumm);
                }
                await debtors.save();
            }

            groups.count_students = String(Number(groups.count_students) - 1);
            const groupCount = await groups.save();

            const group_student = await GroupStudents.findAll({
                where: {
                    status: "active",
                    student_id: id,
                },
            });
            if (group_student.length == 0) {
                findPersonById.status = del_status ? 'inactive' : "pending";
            }
            const studentSave = await findPersonById.save();
            await sendMessage(data);
            const text = `${findPersonById.firstname + " " + findPersonById.lastname}ni ${groups.name} guruhidan chiqarib yuborildi`;
            await logSystemController.logsAdd({ reqdata: req, text });

            res.json({ groupStudentDelete, groupCount, studentSave });
        } catch (error) {
            console.log(273, error.stack);
            return next(ApiError.badRequest(error));
        }
    }

    async studentOneDelete(req, res, next) {
        try {
            const { id } = req.params;
            if (!validateFun.isValidUUID(id)) {
                return next(ApiError.badRequest("The data was entered incorrectly"));
            }
            const findPersonById = await Students.findOne({ where: { id } });

            if (!findPersonById) {
                return next(
                    ApiError.badRequest(`Ushbu ${id} idli malumotlar topilmadi`)
                );
            }

            const groups = await Groups.findAll({
                where: { status: "active" },
            });
            const groupStudents = await GroupStudents.findAll({
                where: {
                    [Op.or]: [
                        { status: "active" },
                        { status: "frozen" }, // Replace 'another_status' with the second status you want to query
                        { status: "test" }, // Replace 'another_status' with the second status you want to query
                    ],
                    student_id: id,
                },
            });

            groupStudents.forEach((e) => {
                groups.find((el) => {
                    if (e.group_id == el.id) {
                        el.update({
                            count_students: String(Number(el.count_students) - 1),
                        });
                    }
                    e.update({ status: "inactive" });
                });
            });

            for (const data of groupStudents) {
                const monthOne = new Date().getMonth() + 1;
                const year = new Date().getFullYear();
                const group = groups.find((el) => el == data.group_id)
                const currentMonth =
                    new Date().getFullYear() +
                    "-" +
                    (monthOne <= 9 ? "0" : "") +
                    "" +
                    monthOne;
                const debtors = await Debtors.findOne({
                    where: {
                        status: "active",
                        group_id: data.group_id,
                        student_id: id,
                        month: currentMonth,
                    },
                });

                const freeze_studentsOne = await FreezeStudents.findOne({
                    where: {
                        status: "active",
                        student_id: id,
                        group_id: data.group_id,
                        group_student_id: data.id,
                    },
                });

                const lessonGroupOne = await LessonGroup.findOne({
                    where: {
                        group_id: data.group_id,
                        status: "active",
                    },
                });

                const teacherGroup = await TeacherGroups.findOne({
                    where: {
                        status: 'active',
                        group_id: data.group_id
                    }
                });


                const teacher = teacherGroup && await Teachers.findOne({
                    where: {
                        status: 'active',
                        id: teacherGroup.teacher_id
                    }
                });

                teacher && await TeacherStatistics.create({
                    group_id: data.group_id,
                    student_id: id,
                    student_status: 'delete',
                    student_count: group.count_students,
                    teacher_id: teacher ? teacher.id : ''
                });

                const weekDay =
                    lessonGroupOne &&
                    lessonGroupOne.lesson_day.split(",").map((e) => Number(e));
                if (debtors) {
                    const startTimeWeek = new Date(debtors.createdAt).getDay();
                    const endTimeWeek =
                        freeze_studentsOne &&
                        new Date(freeze_studentsOne.start_date).getDay();
                    const startGroupSchedule = await GroupSchedule.findOne({
                        where: {
                            group_id: data.group_id,
                            status: "active",
                            day_of_week: startTimeWeek,
                        },
                    });

                    const endData = await GroupSchedule.findOne({
                        where: {
                            group_id: data.group_id,
                            status: "active",
                            day_of_week: new Date(debtors.createdAt).getDay(),
                        },
                    });

                    const endGroupSchedule =
                        freeze_studentsOne &&
                        endTimeWeek &&
                        (await GroupSchedule.findOne({
                            where: {
                                group_id: data.group_id,
                                status: "active",
                                day_of_week: endTimeWeek,
                            },
                        }));

                    const start_time_1 = (new Date(debtors.createdAt).getHours() <= 9 ? "0" : '') + '' + new Date(debtors.createdAt).getHours() + ':'
                        + (new Date(debtors.createdAt).getMinutes() <= 9 ? "0" : '') + '' + new Date(debtors.createdAt).getMinutes() + ':' +
                        (new Date(debtors.createdAt).getSeconds() <= 9 ? "0" : '') + new Date(debtors.createdAt).getSeconds();
                    const end_time = validateFun.isLocatonTime().split(" ")[1];



                    const lessonDay = CountWeekdays.countWeekdaysInMonth(
                        monthOne,
                        year,
                        weekDay
                    );

                    const lessonLastDay = !freeze_studentsOne
                        ? CountWeekdays.countWeekdaysInRangeNew({
                            week_day: weekDay,
                            start_date: debtors.createdAt,
                            start_time_1,
                            start_time_2: startGroupSchedule
                                ? startGroupSchedule.lesson_time
                                : false,
                            end_date: validateFun.isLocatonTime(),
                            end_time_1: end_time,
                            end_time_2: endData
                                ? endData.lesson_time
                                : false,
                        })
                        : CountWeekdays.countWeekdaysInRangeNew({
                            start_date: debtors.createdAt,
                            end_date: freeze_studentsOne.start_date,
                            start_time_1: start_time_1,
                            end_time_1: freeze_studentsOne.start_time,
                            start_time_2: startGroupSchedule
                                ? startGroupSchedule.lesson_time
                                : false,
                            end_time_2: endGroupSchedule
                                ? endGroupSchedule.lesson_time
                                : false,
                            week_day: weekDay,
                        });

                    const amountSum = Math.trunc(
                        (lessonLastDay * debtors.all_summa) / lessonDay
                    );
                    const paySumm = debtors.all_summa - debtors.amount - amountSum;
                    if (paySumm >= 0) {
                        debtors.status = "inactive";
                    } else if (paySumm < 0) {
                        debtors.amount = Math.abs(paySumm);
                    }
                    await debtors.save();
                }
            }

            if (!groupStudents) {
                return next(
                    ApiError.badRequest(`Ushbu malimotlarni o'gartirib bo'lmadi`)
                );
            }
            findPersonById.status = "inactive";
            const studentDeletes = await findPersonById.save();
            if (!studentDeletes) {
                return next(
                    ApiError.badRequest(
                        `Ush bu ${id} id tegishli malumotlarni o'zgartirib bo'lmadi`
                    )
                );
            };



            const text = `${findPersonById.firstname + " " + findPersonById.lastname}ni malumotlari o'chirildi.`;
            await logSystemController.logsAdd({ reqdata: req, text });
            res.json({ studentDeletes, groupStudents });
        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }

    async studentPut(req, res, next) {
        try {
            const { id } = req.params;
            if (!validateFun.isValidUUID(id)) {
                return next(ApiError.badRequest("The data was entered incorrectly"));
            }
            const {
                firstname,
                gender,
                birthday,
                lastname,
                fathername,
                address,
                fatherPhone,
                motherPhone,
                sciences,
                classStudentdent,
            } = req.body;

            const findPersonById = await Students.findOne({ where: { id } });

            if (!findPersonById) {
                return next(ApiError.badRequest(`Ushbu idli o'quvchi topilmadi`));
            }

            if (firstname) findPersonById.firstname = firstname;
            if (gender) findPersonById.gender = gender;
            if (birthday) findPersonById.birthday = birthday;
            if (lastname) findPersonById.lastname = lastname;
            if (fathername) findPersonById.fathername = fathername;
            if (address) findPersonById.address = address;
            if (fatherPhone) findPersonById.fatherPhone = fatherPhone;
            if (motherPhone) findPersonById.motherPhone = motherPhone;
            if (sciences) findPersonById.science = [...[], []];
            await findPersonById.save();
            if (sciences) findPersonById.science = sciences;
            if (classStudentdent) findPersonById.class = classStudentdent;
            const DTMDelete =
                findPersonById.dtmcolumns_id &&
                (await DTMColumns.findOne({
                    where: {
                        status: "active",
                        id: findPersonById.dtmcolumns_id,
                    },
                }));
            let createDTM;
            if (DTMDelete && sciences) {
                DTMDelete.status = "inactive";
                await DTMDelete.save();
                createDTM = await DTMColumns.create({
                    name: "DTM Fanlar",
                    items: sciences,
                    order: 1,
                });
            }

            if (!DTMDelete && sciences) {
                createDTM = await DTMColumns.create({
                    name: "DTM Fanlar",
                    items: sciences,
                    order: 1,
                });
            }

            findPersonById.dtmcolumns_id = createDTM && createDTM.id;
            const studentUpdate = await findPersonById.save();
            if (!studentUpdate) {
                return next(
                    ApiError.badRequest(
                        `Ush bu ${id} id tegishli malumotlarni o'zgartirib bo'lmadi`
                    )
                );
            }
            const text = `${findPersonById.firstname + " " + findPersonById.lastname}ni malumotlari o'zgartirildi.`;
            await logSystemController.logsAdd({ reqdata: req, text });
            res.json({ studentUpdate });
        } catch (error) {
            console.log(243, error);
            return next(ApiError.badRequest(error));
        }
    }

    async studentGet(req, res, next) {
        try {
            const student = await Students.findAll({
                where: { status: "active" },
            });
            const data =
                student &&
                student.sort((a, b) => a.firstname.localeCompare(b.firstname));
            res.json(data);
        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }

    async studentGetOne(req, res, next) {
        try {
            const { id } = req.params;
            if (!validateFun.isValidUUID(id)) {
                return next(ApiError.badRequest("The data was entered incorrectly"));
            }
            const groupStudent = await GroupStudents.findAll({
                where: {
                    // status: "active",
                    student_id: id,
                },
            });
            const sciences = await Sciences.findAll({
                where: { status: "active" },
            });
            const payments = await Payments.findAll({
                where: {
                    status: "active",
                },
            });
            const payment_types = await PaymentTypes.findAll({
                where: {
                    status: "active",
                },
            });
            const group = await Groups.findAll({
                where: {
                    status: "active",
                },
            });
            const student = await Students.findOne({
                where: { id, status: "active" },
            });

            const dtmColumns =
                student.dtmcolumns_id &&
                (await DTMColumns.findOne({
                    where: {
                        status: "active",
                        id: student.dtmcolumns_id,
                    },
                }));

            let groupListOne = [];
            groupStudent.map((el) => {
                let groupOne = group.find((e) => e.id == el.group_id);
                let data = groupOne && {
                    id: el.group_id,
                    wallet: el.wallet,
                    name: groupOne.name,
                    month_payment: el.month_payment,
                    group_student_id: el.id,
                };

                return groupListOne.push(data);
            });

            let paymentList = [];
            payments &&
                groupStudent.forEach((el) => {
                    let paymentOne = payments.filter((e) => e.group_student_id === el.id);
                    if (paymentOne) {
                        paymentOne.map((e) => {
                            const payment_typesOne = payment_types.find((ele) => ele.payment_id == e.id);
                            const groupOne = payment_typesOne && group.find((ele) => ele.id == payment_typesOne.group_id);
                            let data = {
                                updatedAt: e.updatedAt,
                                createdAt: e.createdAt,
                                sale: e.sale,
                                amount: e.amount,
                                type: payment_typesOne ? payment_typesOne.payment_type : '',
                                group_name: groupOne ? groupOne.name : ''

                            };
                            return paymentList.push(data);
                        });
                    }
                    return;
                });

            const sciencesData =
                dtmColumns &&
                dtmColumns.items &&
                dtmColumns.items.map((el) => {
                    const scienceOne = sciences.find((e) => e.id == el);
                    return {
                        id: scienceOne.id,
                        name: scienceOne.name,
                    };
                });

            const columns = sciencesData &&
                dtmColumns &&
                dtmColumns.items && {
                id: dtmColumns.id,
                name: dtmColumns.name,
                items: sciencesData,
            };
            let studentList = {
                firstname: student.firstname,
                lastname: student.lastname,
                fathername: student.fathername,
                gender: student.gender,
                birthday: student.birthday,
                address: student.address,
                fatherPhone: student.fatherPhone,
                motherPhone: student.motherPhone,
                group: groupListOne && removeDuplicateNames(groupListOne),
                paymentList: paymentList && paymentList,
                class: student.class,
                sciences: sciencesData && sciencesData.length > 0 ? sciencesData : [],
                dtm_columns: columns && columns,
                rating: student.rating,
                blacklist_id: student.blacklist_id ? student.blacklist_id : [],
            };

            res.json(studentList);
        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }

    async studentGetList(req, res, next) {
        try {
            const groups = await Groups.findAll({ where: { status: "active" } });
            const groupStudents = await GroupStudents.findAll({
                where: {
                    [Op.or]: [
                        { status: "active" },
                        { status: "frozen" }, // Replace 'another_status' with the second status you want to query
                        { status: "test" }, // Replace 'another_status' with the second status you want to query
                    ],
                },
            });
            const sciences = await Sciences.findAll({
                where: { status: "active" },
            });
            const students = await Students.findAll({
                where: { status: "active" },
            });
            const teacher_groups = await TeacherGroups.findAll({
                where: {
                    status: 'active',
                }
            });
            const teachers = await Teachers.findAll({
                where: {
                    status: 'active',
                    job_type: 'teacher'
                }
            });

            const studentSort =
                students &&
                students.sort((a, b) => a.firstname.localeCompare(b.firstname));

            const studentList =
                groups &&
                studentSort &&
                groupStudents &&
                studentSort.map((el) => {
                    const groupFilter = groupStudents.find(
                        (e) => e.student_id == el.id
                    );
                    const groupName = groupFilter && groups.find((e) => groupFilter?.group_id == e.id);
                    const teacher_groupsOne = groupName && teacher_groups.find((e) => e.group_id == groupName.id);
                    const teacherOne = teacher_groupsOne && teachers.find((e) => e.id == teacher_groupsOne.teacher_id)
                    const sciencesData =
                        el &&
                        el.science &&
                        el.science
                            .map((el) => {
                                const scienceOne = sciences.find((e) => e.id == el);
                                return (
                                    scienceOne && {
                                        id: scienceOne.id,
                                        name: scienceOne.name,
                                    }
                                );
                            })
                            .filter((e) => e && e);
                    const data = {
                        id: el.id,
                        firstname: el.firstname,
                        lastname: el.lastname,
                        Fphone: el.fatherPhone,
                        address: el.address,
                        Mphone: el.motherPhone,
                        class: el.class,
                        groups: {
                            id: groupName?.id,
                            name: groupName?.name,
                            month_payment: groupName?.month_payment,
                        },
                        teacher: {
                            id: teacherOne && teacherOne?.id ? teacherOne?.id : '',
                            firstname: teacherOne && teacherOne?.firstname ? teacherOne?.firstname : '',
                            lastname: teacherOne && teacherOne?.lastname ? teacherOne?.lastname : '',
                            job_type: teacherOne && teacherOne?.job_type ? teacherOne?.job_type : '',

                        },
                        sciences:
                            sciencesData && sciencesData.length > 0 ? sciencesData : [],
                    };
                    return data;
                });

            const studentFuc = async () => {
                const data = await Promise.all(studentList.map(async (e) => await e));
                return res.json({ data, student_count: data.length });
            };
            const studentResult = studentFuc();
            return studentResult;
        } catch (error) {
            console.log(482, error.stack);
            return next(ApiError.badRequest(error));
        }
    }

    async studentGroupGetList(req, res, next) {
        try {
            const { group_id } = req.params;
            if (!validateFun.isValidUUID(group_id)) {
                return next(ApiError.badRequest("The data was entered incorrectly"));
            }
            const monthOne = new Date().getMonth() + 1;
            const month =
                new Date().getFullYear() +
                "-" +
                (monthOne <= 9 ? "0" : "") +
                "" +
                monthOne;

            const groups = await Groups.findOne({
                where: { status: "active", id: group_id },
            });
            const groupStudent = await GroupStudents.findAll({
                where: {
                    [Op.or]: [
                        { status: "active" },
                        { status: "frozen" }, // Replace 'another_status' with the second status you want to query
                        { status: "test" }, // Replace 'another_status' with the second status you want to query
                    ],
                    group_id: group_id,
                },
            });

            const freezeStudents = await FreezeStudents.findAll({
                where: {
                    status: "active",
                    group_id: group_id,
                },
            });
            const sciences = await Sciences.findAll({
                where: { status: "active" },
            });
            const student = await Students.findAll({
                where: { status: "active" },
            });
            const debtor = await Debtors.findAll({
                where: {
                    status: "active",
                    month: month,
                    group_id,
                },
            });

            const query = `SELECT
      json_build_object(
          'attendance_id', a.id,
          'attendance_date', a.date,
          'attendance_status', a.status,
          'attendance_students', json_agg(
              json_build_object(
                  'attendance_student_id', as1.id,
                  'attendance_student_status', as1.attendan_student_status,
                  'attendance_student_comment', as1.comment,
                  'student_id', s.id,
                  'student_lastname', s.lastname,
                  'student_firstname', s.firstname
              )
          )
      ) AS data
  FROM attendanses AS a
  JOIN attendansi_students AS as1 ON a.id::VARCHAR(255) = as1.attendan_id::VARCHAR(255)
  JOIN students AS s ON as1.student_id::VARCHAR(255) = s.id::VARCHAR(255)
  WHERE a.group_id::VARCHAR(255) = '${group_id}' AND a.status = 'active' AND as1.status = 'active'
  GROUP BY a.id, a.date, a.status;
      `;
            const data = await sequelize.query(query);

            const studentsList = [];
            if (groupStudent && groupStudent.length > 0) {
                for (const el of groupStudent) {
                    const student = await Students.findOne({
                        where: {
                            status: "active",
                            id: el.student_id,
                        },
                    });
                    if (student) {
                        studentsList.push(student);
                    }
                }
            }
            const studentResultSql = [];
            if (studentsList && studentsList.length > 0 && data && data.length > 0) {
                studentsList.forEach((el) => {
                    const newData = data[0]
                        .map((e) => {
                            const studentOneData = e.data.attendance_students.find(
                                (ele) => ele.student_id == el.id
                            );
                            return (
                                studentOneData && {
                                    id: e.data.attendance_id,
                                    date: e.data.attendance_date,
                                    status: studentOneData?.attendance_student_status
                                        ? studentOneData?.attendance_student_status
                                        : "",
                                    comment: studentOneData?.attendance_student_comment
                                        ? studentOneData?.attendance_student_comment
                                        : "",
                                    attendance_student_id: studentOneData?.attendance_student_id
                                        ? studentOneData?.attendance_student_id
                                        : "",
                                }
                            );
                        })
                        .filter((e) => e && e);
                    studentResultSql.push({
                        id: el.id,
                        lastname: el.lastname,
                        firstname: el.firstname,
                        data: newData.sort((a, b) => {
                            return new Date(a.date) - new Date(b.date);
                        }),
                    });
                });
            }

            const sudentSort =
                student &&
                student.sort((a, b) => a.firstname.localeCompare(b.firstname));
            const studentList =
                groupStudent &&
                groups &&
                sudentSort &&
                sudentSort.map((students) => {
                    const group_student = groupStudent.find(
                        (e) => e.student_id == students.id
                    );
                    const sciencesData =
                        students.science &&
                        students.science.map((el) => {
                            const scienceOne = sciences.find((e) => e.id == el);
                            return {
                                id: scienceOne && scienceOne.id && scienceOne.id,
                                name: scienceOne && scienceOne.name && scienceOne.name,
                            };
                        });
                    const debtorOne = debtor.find((e) => e.student_id == students.id);
                    const studentResultSqlOne = studentResultSql.find((el) => {
                        return el.id == students.id;
                    });

                    const ferCom = group_student && freezeStudents.find((e) => e.group_student_id == group_student.id);
                    if (group_student) {
                        return {
                            id: students.id,
                            name: students.firstname + " " + students.lastname,
                            phone: students.fatherPhone
                                ? students.fatherPhone
                                : students.motherPhone,
                            gender: students.gender,
                            class: students.class,
                            group_id: group_id,
                            monthPay: debtorOne
                                ? false
                                : group_student.wallet < 0
                                    ? false
                                    : true,
                            month_payment: group_student.month_payment,
                            group_student_id: group_student.id,
                            groupAllSum: groups.month_payment,
                            status: group_student.status,
                            science:
                                sciencesData && sciencesData.length > 0 ? sciencesData : [],
                            attendansis: studentResultSqlOne ? studentResultSqlOne : {},
                            comment: ferCom ? ferCom.description : ''
                        };
                    }
                });

            const isStudentList = studentList.filter((e) => e && e);

            const studentFuc = async () => {
                const data = await Promise.all(isStudentList.map(async (e) => await e));
                return res.json(data);
            };
            const studentResult = studentFuc();
            return studentResult;
        } catch (error) {
            console.log(441, error.stack);
            return next(ApiError.badRequest(error));
        }
    }

    async studentGetListSearch(req, res, next) {
        try {
            const filters = req.query; 
            const groups = await Groups.findAll({ where: { status: "active" } });
            const groupStudents = await GroupStudents.findAll({
                where: {
                    [Op.or]: [
                        { status: "active" },
                        { status: "frozen" }, // Replace 'another_status' with the second status you want to query
                        { status: "test" }, // Replace 'another_status' with the second status you want to query
                    ],
                },
            });
            const students = await Students.findAll({
                where: { status: "active" },
            });

            const teacher_groups = await TeacherGroups.findAll({
                where: {
                    status: 'active',
                }
            });
            const teachers = await Teachers.findAll({
                where: {
                    status: 'active',
                    job_type: 'teacher'
                }
            })


            const studentFilter = filters.text
                ? students.filter((student) => {
                    const name =
                        student.firstname.toLowerCase() +
                        " " +
                        student.lastname.toLowerCase();
                    const searchText = filters.text.toLowerCase();
                    return name.includes(searchText);
                })
                : students;

            const studentList =
                groups &&
                students &&
                groupStudents &&
                studentFilter.map((el) => {
                    const groupFilter = groupStudents.find(
                        (e) => e.student_id == el.id
                    );
                    const groupName = groupFilter && groups.find((e) => groupFilter?.group_id == e.id);
                    const teacher_groupsOne = groupName && teacher_groups.find((e) => e.group_id == groupName.id);
                    const teacherOne = teacher_groupsOne && teachers.find((e) => e.id == teacher_groupsOne.teacher_id);
                    const data = {
                        id: el.id,
                        firstname: el.firstname,
                        lastname: el.lastname,
                        Fphone: el.fatherPhone,
                        address: el.address,
                        Mphone: el.motherPhone,
                        groups: {
                            id: groupName?.id,
                            name: groupName?.name,
                            month_payment: groupName?.month_payment,
                        },
                        teacher: {
                            id: teacherOne && teacherOne?.id ? teacherOne?.id : '',
                            firstname: teacherOne && teacherOne?.firstname ? teacherOne?.firstname : '',
                            lastname: teacherOne && teacherOne?.lastname ? teacherOne?.lastname : '',
                            job_type: teacherOne && teacherOne?.job_type ? teacherOne?.job_type : '',

                        },
                        class: el.class,
                    };
                    return data;
                });
            const studentFuc = async () => {
                const data = await Promise.all(studentList.map(async (e) => await e));
                return res.json(data);
            };
            const studentResult = studentFuc();
            return studentResult;
        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }

    async studentAddFreeze(req, res, next) {
        try {
            const { student_id, group_id, group_student_id, description } = req.body;
            const start_date = validateFun.isLocatonTime().split(" ")[0];
            const start_time = validateFun.isLocatonTime().split(" ")[1];
            if (!student_id || !validateFun.isValidUUID(student_id)) {
                return next(ApiError.badRequest("no student found"));
            } else {
                const studnet = await Students.findOne({
                    where: {
                        id: student_id,
                        status: "active",
                    },
                });
                if (!studnet) {
                    return next(ApiError.badRequest("no student found"));
                }
            }
            if (!group_id || !validateFun.isValidUUID(group_id)) {
                return next(ApiError.badRequest("group not found"));
            } else {
                const group = await Groups.findOne({
                    where: {
                        id: group_id,
                        status: "active",
                    },
                });
                if (!group) {
                    return next(ApiError.badRequest("group not found"));
                }
            }
            if (!group_student_id || !validateFun.isValidUUID(group_student_id)) {
                return next(ApiError.badRequest("group not found"));
            } else {
                const group_student_one = await GroupStudents.findOne({
                    where: {
                        id: group_student_id,
                        status: "active",
                    },
                });
                if (!group_student_one) {
                    return next(ApiError.badRequest("group not found"));
                }
            }
            const group_student = await GroupStudents.findOne({
                where: {
                    status: "active",
                    group_id,
                    student_id,
                },
            });
            if (group_student_id != group_student?.id) {
                return next(ApiError.badRequest("There is an error in your data"));
            }
            if (!description) {
                return next(ApiError.badRequest("must be a description"));
            }

            const freeze_studentsOne = await FreezeStudents.findOne({
                where: {
                    status: "active",
                    student_id,
                    group_id,
                    group_student_id,
                },
            });
            if (freeze_studentsOne) {
                return next(ApiError.badRequest("This reader has been frozen"));
            }
            const studnet = await Students.findOne({
                where: {
                    id: student_id,
                    status: "active",
                },
            });

            const freeze_students =
                group_student &&
                (await FreezeStudents.create({
                    student_id,
                    group_id,
                    start_date,
                    end_date: "",
                    end_time: "",
                    start_time,
                    group_student_id,
                    description,
                }));

            if (group_student) {
                group_student.status = "frozen";
                await group_student.save();
            }
            const text = `${studnet.firstname + " " + studnet.lastname}ni muzlatib qo'yildi.`;
            await logSystemController.logsAdd({ reqdata: req, text });

            return res.send("The reader has been frozen");
        } catch (error) {
            console.log(901, error.stack);
            return next(ApiError.badRequest(error));
        }
    }

    async studentDeleteFreeze(req, res, next) {
        try {
            const { student_id, group_id, group_student_id } = req.body;
            if (!student_id || !validateFun.isValidUUID(student_id)) {
                return next(ApiError.badRequest("no student found"));
            } else {
                const studnet = await Students.findOne({
                    where: {
                        id: student_id,
                        status: "active",
                    },
                });
                if (!studnet) {
                    return next(ApiError.badRequest("no student found"));
                }
            }
            if (!group_id || !validateFun.isValidUUID(group_id)) {
                return next(ApiError.badRequest("group not found"));
            } else {
                const group = await Groups.findOne({
                    where: {
                        id: group_id,
                        status: "active",
                    },
                });
                if (!group) {
                    return next(ApiError.badRequest("group not found"));
                }
            }
            if (!group_student_id || !validateFun.isValidUUID(group_student_id)) {
                return next(ApiError.badRequest("group student not found"));
            } else {
                const group_student_one = await GroupStudents.findOne({
                    where: {
                        id: group_student_id,
                        status: "frozen",
                    },
                });
                if (!group_student_one) {
                    return next(ApiError.badRequest("group student not found"));
                }
            }
            const group_student = await GroupStudents.findOne({
                where: {
                    status: "frozen",
                    group_id,
                    student_id,
                },
            });
            if (group_student_id != group_student?.id) {
                return next(ApiError.badRequest("There is an error in your data"));
            }

            const freeze_studentsOne = await FreezeStudents.findOne({
                where: {
                    status: "active",
                    student_id,
                    group_id,
                    group_student_id,
                },
            });
            if (!freeze_studentsOne) {
                return next(ApiError.badRequest("This reader has been frozen"));
            }

            const lessonGroupOne = await LessonGroup.findOne({
                where: {
                    group_id,
                    status: "active",
                },
            });

            const weekDay =
                lessonGroupOne &&
                lessonGroupOne.lesson_day.split(",").map((e) => Number(e));

            const end_date = validateFun.isLocatonTime().split(" ")[0];
            const end_time = validateFun.isLocatonTime().split(" ")[1];
            freeze_studentsOne.end_date = end_date;
            freeze_studentsOne.end_time = end_time;
            freeze_studentsOne.status = "inactive";
            group_student.status = "active";

            const monthOld =
                freeze_studentsOne.start_date.split("-")[0] +
                "-" +
                freeze_studentsOne.start_date.split("-")[1];

            const debtor = await Debtors.findOne({
                where: {
                    group_id,
                    student_id,
                    status: "active",
                    month: monthOld,
                },
            });

            if (debtor) {
                const startTimeWeek = new Date(freeze_studentsOne.start_date).getDay();
                const endTimeWeek = new Date(
                    validateFun.isLocatonTime().split(" ")[0]
                ).getDay();
                const startGroupSchedule = await GroupSchedule.findOne({
                    where: {
                        group_id,
                        status: "active",
                        day_of_week: startTimeWeek,
                    },
                });
                const endGroupSchedule = await GroupSchedule.findOne({
                    where: {
                        group_id,
                        status: "active",
                        day_of_week: endTimeWeek,
                    },
                });

                const result = CountWeekdays.countWeekdaysInRangeNew_2({
                    week_day: weekDay,
                    start_date: freeze_studentsOne.start_date,
                    start_time_1: freeze_studentsOne.start_time,
                    start_time_2: startGroupSchedule
                        ? startGroupSchedule.lesson_time
                        : false,
                    end_date: validateFun.isLocatonTime().split(" ")[0],
                    end_time_1: validateFun.isLocatonTime().split(" ")[1],
                    end_time_2: endGroupSchedule ? endGroupSchedule.lesson_time : false,
                }); // result student nechta darsga kirmaganligni hisoblayadi jami muzlatilgan sandan chiqarilayorgan sanagacha
                const yearMonht = end_date.split("-")[0] + "-" + end_date.split("-")[1];
                const monthNew = new Date(yearMonht);
                const monthOld = new Date(debtor.month);
                const [year, month] = debtor.month.split("-");

                const [newYear, newMonths, newDate] = end_date.split("-");

                const lessonDayOld = CountWeekdays.countWeekdaysInMonth(
                    month,
                    year,
                    weekDay
                ); // eski oyda nechata dars borligini hisoblaydi
                const lessonDayNew = CountWeekdays.countWeekdaysInMonth(
                    newMonths,
                    newYear,
                    weekDay
                ); // yangi oyda nechata dars borligini hisoblaydi
                if (monthNew > monthOld) {
                    const newMonthsFreezeDay = CountWeekdays.countWeekdaysInRangeNew_2({
                        week_day: weekDay,
                        start_date: monthNew,
                        start_time_1: '00:00:00',
                        start_time_2: false,
                        end_date: end_date,
                        end_time_1: end_time,
                        end_time_2: endGroupSchedule ? endGroupSchedule.lesson_time : false,
                    }); //  yangi oyda nechta darsga kirmaganlini hisoblaydi

                    const oldMonthsFreezeDay = CountWeekdays.countWeekdaysInRangeNew_2({
                        week_day: weekDay,
                        start_date: freeze_studentsOne.start_date,
                        start_time_1: freeze_studentsOne.start_time,
                        start_time_2: startGroupSchedule ? startGroupSchedule.lesson_time : false,
                        end_date: CountWeekdays.getLastDateOfMonth(freeze_studentsOne.start_date),
                        end_time_1: '00:00:00',
                        end_time_2: false,
                    }); //  eski oyda nechta darsga kirmaganlini hisoblaydi

                    const newMonthsAmount = Math.trunc(((lessonDayNew - newMonthsFreezeDay) * group_student.month_payment) / lessonDayNew) // yangi oy uchun qarz miqdori 
                    const oldMonthsAmount = Math.trunc(((lessonDayOld - oldMonthsFreezeDay) * debtor.all_summa) / lessonDayOld) // eski oy uchun qarz miqdori

                    if (newMonthsAmount && newMonthsAmount > 0) {
                        Debtors.create({
                            student_id,
                            group_id,
                            month: yearMonht,
                            amount: Math.trunc(newMonthsAmount),
                            all_summa: Math.trunc(newMonthsAmount),
                        });
                    }

                    if (oldMonthsAmount && oldMonthsAmount > 0) {
                        debtor.amount = oldMonthsAmount;
                        debtor.all_summa = oldMonthsAmount;
                    } else {
                        debtor.all_summa = 0;
                        debtor.status = 'inactive'
                    }



                } else if (monthNew == monthOld) {
                }
            } else {

            }

            const studnet = await Students.findOne({
                where: {
                    id: student_id,
                    status: "active",
                },
            });

            const text = `${studnet.firstname + " " + studnet.lastname}ni muzlatishdan chiqarildi.`;
            await logSystemController.logsAdd({ reqdata: req, text });

            await freeze_studentsOne.save();
            await group_student.save();

            return res.send("The reader has been activated");
        } catch (error) {
            console.log(901, error.stack);
            return next(ApiError.badRequest(error));
        }
    }

    //   async studentFreezeCron_1(req, res, next) {
    //     try {
    //       const monthOne = new Date().getMonth() + 1;
    //       const day = new Date().getDate();
    //       const currentDate =
    //         new Date().getFullYear() +
    //         "-" +
    //         (monthOne <= 9 ? "0" : "") +
    //         "" +
    //         monthOne +
    //         "-" +
    //         (day <= 9 ? "0" : "") +
    //         "" +
    //         day;

    //       const query = `
    //       -- Update status to 'frozen' in group_students if freeze_students status is 'active'
    // UPDATE group_students
    // SET status = 'frozen'
    // WHERE status = 'active'
    //   AND EXISTS (
    //     SELECT 1
    //     FROM freeze_students
    //     WHERE freeze_students.student_id::VARCHAR(255) = group_students.student_id::VARCHAR(255)
    //       AND freeze_students.group_id::VARCHAR(255) = group_students.group_id::VARCHAR(255)
    //       AND freeze_students.status = 'active'
    // );

    // -- Insert date into group_students if it matches start_date in freeze_students
    // INSERT INTO group_students (status, student_id, group_id)
    // SELECT 'active', freeze_students.student_id, freeze_students.group_id
    // FROM freeze_students
    // WHERE freeze_students.start_date = '${currentDate}' and freeze_students.status='active'
    //   AND NOT EXISTS (
    //     SELECT 1
    //     FROM group_students
    //     WHERE group_students.student_id::VARCHAR(255) = freeze_students.student_id::VARCHAR(255)
    //       AND group_students.group_id::VARCHAR(255) = freeze_students.group_id::VARCHAR(255)::VARCHAR(255)
    // );

    //       `;

    //       const group_student = await sequelize.query(query);

    //       res.send(currentDate);
    //     } catch (error) {
    //       console.log(901, error.stack);
    //       return next(ApiError.badRequest(error));
    //     }
    //   }
}

module.exports = new StudentController();
