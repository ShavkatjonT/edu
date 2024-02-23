const ApiError = require('../error/ApiError');
const {
    Groups,
    Teachers,
    GroupStudents,
    TeacherGroups,
    Students,
    Rooms,
    LessonGroup,
    Debtors,
    GroupSchedule,
    Attendansi,
    AttendansiStudent, User
} = require('../models/models');
const timeFun = require('./timeFun');
const jwt = require('jsonwebtoken');
const CountWeekdays = require('./countWeekdays');
const validateFun = require('./validateFun');
const sequelize = require('../db')
const { Op } = require("sequelize");
const groupStudentCreate = require('./groupStudentCreate')
const telegramBot = require("./telegramBot");
const logSystemController = require("./logSystemController");

class GroupsController {
    async groupAdd(req, res, next) {
        try {
            const { name, month_payment, sale, time, day, room_id, teacher_id } =
                req.body;
            if (!name) {
                return next(ApiError.badRequest("Group name yo'q"));
            }
            if (!teacher_id || !validateFun.isValidUUID(teacher_id)) {
                return next(ApiError.badRequest("Teacher_id topilmadi"));
            }
            if (!month_payment) {
                return next(ApiError.badRequest("Month_payment  yo'q"));
            } else {
                let inNumber = typeof month_payment;
                if (inNumber !== 'number') {
                    return next(ApiError.badRequest('Summani raqamda kiriting'));
                }
            }
            if (!time) {
                return next(ApiError.badRequest('data is incomplete'));
            }
            if (!day) {
                return next(ApiError.badRequest('data is incomplete'));
            } else {
                const result = CountWeekdays.validateArray(day);
                if (!result) {
                    return next(
                        ApiError.badRequest('Error: Array contains invalid number(s).')
                    );
                }
            }
            if (!room_id || !validateFun.isValidUUID(room_id)) {
                return next(ApiError.badRequest('data is incomplete'));
            }
            const room = await Rooms.findOne({
                where: {
                    status: 'active',
                    id: room_id,
                },
            });
            if (!room) {
                return next(ApiError.badRequest('no data found'));
            }
            let resAllTime = false;
            for (const weekDay of day) {
                const groupSchedule = await GroupSchedule.findAll({
                    where: {
                        status: 'active',
                        day_of_week: weekDay,
                        room_id,
                    },
                });
                let resTime = false;
                if (groupSchedule && groupSchedule.length > 0) {
                    for (const data of groupSchedule) {
                        const timeFunRes = timeFun(data.lesson_time, time);
                        if (!timeFunRes) {
                            resTime = true;
                            break;
                        }
                    }
                }
                if (resTime) {
                    resAllTime = true;
                    break;
                }
            }
            if (resAllTime) {
                return next(
                    ApiError.badRequest('At this time there is a lesson in the room')
                );
            }

            if (sale || sale == 0) {
                let inNumber = typeof sale;
                if (inNumber !== 'number') {
                    return next(ApiError.badRequest('sale raqamda kiriting'));
                }
            }
            if (sale < 0 || sale > 100) {
                return next(ApiError.badRequest("Foizni 100 va 0 oralig'da bo'lsin"));
            }

            const group = await Groups.create({
                name,
                month_payment,
                sale,
            });
            const groupScheduleAll = [];
            for (const weekDay of day) {
                const groupScheduleOne = await GroupSchedule.create({
                    room_id,
                    lesson_time: time,
                    group_id: group.id,
                    day_of_week: weekDay,
                    teacher_id,
                });
                if (groupScheduleOne) {
                    groupScheduleAll.push(groupScheduleOne.day_of_week);
                }
            }

            await LessonGroup.create({
                room_id,
                lesson_time: time,
                group_id: group.id,
                lesson_day: groupScheduleAll.join(','),
                teacher_id,
            });

            const newWeekDay = new Date().getDay();
            if (day.includes(newWeekDay)) {
                const timeLocation = validateFun.isLocatonTime();
                const timeFormat = (new Date(timeLocation).getHours() <= 9 ? "0" : '') + '' + new Date(timeLocation).getHours() + ':'
                    + (new Date(timeLocation).getMinutes() <= 9 ? "0" : '') + '' + new Date(timeLocation).getMinutes() + ':' +
                    (new Date(timeLocation).getSeconds() <= 9 ? "0" : '') + new Date(timeLocation).getSeconds();
                const timeRes = CountWeekdays.calculateAttendanceEndTime(time, timeFormat);
                if (timeRes && timeRes == 'truevalue') {
                    const year = new Date().getFullYear();
                    const month = new Date().getMonth() + 1;
                    const day = new Date().getDate();
                    await Attendansi.create({
                        group_id: group.id,
                        date: year + '-' + (month <= 9 ? '0' + month : month) + '-' + (day <= 9 ? '0' + day : day),
                        in_attendansi: false
                    })
                };
            };

            const text = `${name} guruhi yaratildi`;
            await logSystemController.logsAdd({ reqdata: req, text });

            res.json({ group });
        } catch (error) {
            console.log(147, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async groupLesson(req, res, next) {
        try {
            const { name, month_payment, sale, teacher_id, week_data } = req.body;
            if (!name) {
                return next(ApiError.badRequest("Group name yo'q"));
            }
            if (!teacher_id || !validateFun.isValidUUID(teacher_id)) {
                return next(ApiError.badRequest("teacher_id topilmadi"));
            }
            if (!month_payment) {
                return next(ApiError.badRequest("Month_payment  yo'q"));
            } else {
                let inNumber = typeof month_payment;
                if (inNumber !== 'number') {
                    return next(ApiError.badRequest('Summani raqamda kiriting'));
                }
            }
            if (sale || sale == 0) {
                let inNumber = typeof sale;
                if (inNumber !== 'number') {
                    return next(ApiError.badRequest('sale raqamda kiriting'));
                }
            }
            if (sale < 0 || sale > 100) {
                return next(ApiError.badRequest("Foizni 100 va 0 oralig'da bo'lsin"));
            }

            if (!week_data || week_data.length <= 0) {
                return next(
                    ApiError.badRequest('There is an error in the weekly data')
                );
            }

            const resWeekData = CountWeekdays.validateWeekData(week_data);
            if (resWeekData) {
                return next(
                    ApiError.badRequest('There is an error in the weekly data')
                );
            }
            let resAllTime = false;
            for (const data of week_data) {
                const groupSchedule = await GroupSchedule.findAll({
                    where: {
                        status: 'active',
                        day_of_week: data.week_day,
                        room_id: data.room_id,
                    },
                });
                let resTime = false;
                if (groupSchedule && groupSchedule.length > 0) {
                    for (const groupScheduleData of groupSchedule) {
                        const timeFunRes = timeFun(
                            groupScheduleData.lesson_time,
                            data.time
                        );
                        if (!timeFunRes) {
                            resTime = true;
                            break;
                        }
                    }
                }
                if (resTime) {
                    resAllTime = true;
                    break;
                }
            }
            if (resAllTime) {
                return next(
                    ApiError.badRequest('At this time there is a lesson in the room')
                );
            }
            const group = await Groups.create({
                name,
                month_payment,
                sale,
            });

            const groupScheduleAll = [];
            for (const data of week_data) {
                const groupScheduleOne = await GroupSchedule.create({
                    room_id: data.room_id,
                    lesson_time: data.time,
                    group_id: group.id,
                    day_of_week: data.week_day,
                    teacher_id,
                });
                if (groupScheduleOne) {
                    groupScheduleAll.push(groupScheduleOne.day_of_week);
                }
            }
            await LessonGroup.create({
                group_id: group.id,
                lesson_day: groupScheduleAll.join(','),
                teacher_id,
            });

            const newWeekDay = new Date().getDay();
            const findData = week_data.find((el) => el && el?.week_day && el.week_day == newWeekDay);
            if (findData) {
                const timeLocation = validateFun.isLocatonTime();
                const timeFormat = (new Date(timeLocation).getHours() <= 9 ? "0" : '') + '' + new Date(timeLocation).getHours() + ':'
                    + (new Date(timeLocation).getMinutes() <= 9 ? "0" : '') + '' + new Date(timeLocation).getMinutes() + ':' +
                    (new Date(timeLocation).getSeconds() <= 9 ? "0" : '') + new Date(timeLocation).getSeconds();
                const timeRes = CountWeekdays.calculateAttendanceEndTime(findData.time, timeFormat);
                if (timeRes && timeRes == 'truevalue') {
                    const year = new Date().getFullYear();
                    const month = new Date().getMonth() + 1;
                    const day = new Date().getDate();
                    await Attendansi.create({
                        group_id: group.id,
                        date: year + '-' + (month <= 9 ? '0' + month : month) + '-' + (day <= 9 ? '0' + day : day),
                        in_attendansi: false
                    })
                };
            }
            const text = `${name} guruhi yaratildi`;
            await logSystemController.logsAdd({ reqdata: req, text })
            res.json({ group });
        } catch (error) {
            console.log(237, error.stack);
            console.log(238, error);
            return next(ApiError.badRequest(error));
        }
    }
    async groupDelete(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            };
            const groupsById = await Groups.findOne({
                where: { id, status: 'active' },
            });

            if (!groupsById) {
                return next(
                    ApiError.badRequest(`Ushbu ${id} idli malumotlar topilmadi`)
                );
            }
            const teacherGroup = await TeacherGroups.findOne({
                where: {
                    status: 'active',
                    group_id: id,
                },
            });

            const lesson_group = await LessonGroup.findOne({
                where: {
                    group_id: id,
                    status: 'active',
                },
            });
            if (lesson_group) {
                lesson_group.status = 'inactve';
                await lesson_group.save();
            }

            if (teacherGroup) teacherGroup.status = 'inactive';
            teacherGroup && (await teacherGroup.save());
            const student = await Students.findAll({
                where: {
                    status: 'active',
                },
            });
            const groupStudentList = await GroupStudents.findAll({
                where: {
                    [Op.or]: [
                        { status: "active" },
                        { status: "frozen" }, // Replace 'another_status' with the second status you want to query
                        { status: "test" }, // Replace 'another_status' with the second status you want to query
                    ], group_id: id
                },
            });
            const groupStudent = await GroupStudents.update(
                { status: 'inactive' },
                {
                    where: {
                        [Op.or]: [
                            { status: "active" },
                            { status: "frozen" }, // Replace 'another_status' with the second status you want to query
                            { status: "test" }, // Replace 'another_status' with the second status you want to query
                        ], group_id: id
                    }
                }
            );
            const studentFilter =
                groupStudentList.length > 0 &&
                student &&
                groupStudentList.map((el) => {
                    const studentOne = student.find((e) => e.id == el.student_id);

                    return studentOne;
                });

            const group_student = await GroupStudents.findAll({
                where: {
                    [Op.or]: [
                        { status: "active" },
                        { status: "frozen" },
                        { status: "test" },
                    ],
                },
            });

            const weekDay =
                lesson_group &&
                lesson_group.lesson_day.split(',').map((e) => Number(e));
            const day = new Date().getDate();
            const monthOne = new Date().getMonth() + 1;
            const year = new Date().getFullYear();
            const currentMonth =
                new Date().getFullYear() + '-' + (monthOne <= 9 ? "0" : '') + '' + monthOne;

            if (studentFilter.length > 0 && studentFilter) {
                for (const el of studentFilter) {
                    const studentOne = group_student.find((e) => e.student_id == el.id);
                    if (!studentOne) {
                        el.update({
                            status: 'pending',
                        });
                    }
                    const debtors = await Debtors.findOne({
                        where: {
                            status: 'active',
                            group_id: id,
                            student_id: el.id,
                            month: currentMonth,
                        },
                    });

                    if (debtors && lesson_group) {
                        const startTimeWeek = new Date(debtors.createdAt).getDay();
                        const end_date = validateFun.isLocatonTime();
                        const endWeekDay = new Date().getDay();
                        const startGroupSchedule = await GroupSchedule.findOne({
                            where: {
                                status: "active",
                                group_id: id,
                                day_of_week: startTimeWeek
                            },
                        });
                        const endGroupSchedule = await GroupSchedule.findOne({
                            where: {
                                group_id: id,
                                status: "active",
                                day_of_week: endWeekDay
                            },
                        });

                        const date = new Date(debtors.createdAt).getDate();
                        const lessonDay = CountWeekdays.countWeekdaysInMonth(
                            monthOne,
                            year,
                            weekDay
                        );
                        const start_time_1 = (new Date(debtors.createdAt).getHours() <= 9 ? "0" : '') + '' + new Date(debtors.createdAt).getHours() + ':'
                            + (new Date(debtors.createdAt).getMinutes() <= 9 ? "0" : '') + '' + new Date(debtors.createdAt).getMinutes() + ':' +
                            (new Date(debtors.createdAt).getSeconds() <= 9 ? "0" : '') + new Date(debtors.createdAt).getSeconds();
                        const end_time_1 = validateFun.isLocatonTime().split(" ")[1];
                        const lessonLastDay = CountWeekdays.countWeekdaysInRangeNew(
                            {
                                week_day: weekDay,
                                start_date: debtors.createdAt,
                                start_time_1,
                                start_time_2: startGroupSchedule?.lesson_time ? startGroupSchedule.lesson_time : false,
                                end_date,
                                end_time_1,
                                end_time_2: endGroupSchedule?.lesson_time ? endGroupSchedule.lesson_time : false
                            }
                        );
                        const amountSum = Math.trunc(
                            (lessonLastDay * debtors.all_summa) / lessonDay
                        );
                        const paySumm = debtors.all_summa - debtors.amount - amountSum;
                        if (paySumm >= 0) {
                            debtors.status = 'inactive';
                        } else if (paySumm < 0) {
                            debtors.amount = Math.abs(paySumm);
                        }
                        await debtors.save();
                    }
                }
            };
            await GroupSchedule.destroy({
                where: {
                    status: 'active',
                    group_id: id,
                },
            });
            groupsById.status = 'inactive';
            const groupsDeletes = await groupsById.save();
            if (!groupsDeletes) {
                return next(
                    ApiError.badRequest(
                        `Ush bu ${id} id tegishli malumotlarni o'zgartirib bo'lmadi`
                    )
                );
            }
            const text = `${groupsById.name} guruh o'chirildi`;
            await logSystemController.logsAdd({ reqdata: req, text });

            res.json({ groupsDeletes, groupStudent });
        } catch (error) {
            console.log(111, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async groupPut(req, res, next) {
        try {
            let createTeacher;
            let teacherGroup;
            const { id } = req.params;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            };
            const {
                name,
                teacher_id,
                month_payment,
                sale,
                month_pay_intrue,
                time,
                day,
                room_id,
            } = req.body;

            if (!room_id || !validateFun.isValidUUID(room_id)) {
                return next(ApiError.badRequest('data is incomplete'));
            }

            if (!teacher_id || !validateFun.isValidUUID(teacher_id)) {
                return next(ApiError.badRequest("Teacher_id topilmadi"));
            }
            const groupById = await Groups.findOne({
                where: { id, status: 'active' },
            });
            if (sale < 0 || 100 < sale) {
                return next(ApiError.badRequest('Re-enter the teacher percentage'));
            }


            const groupStudent = month_pay_intrue
                ? await GroupStudents.update(
                    { month_payment: month_payment },
                    {
                        where: {
                            status: 'active',
                            group_id: id,
                        },
                    }
                )
                : {};

            if (name) {
                groupById.name = name;
            }
            if (sale) {
                groupById.sale = sale;
            }

            await groupById.save();

            if (!day) {
                return next(ApiError.badRequest('data is incomplete'));
            } else {
                const result = CountWeekdays.validateArray(day);
                if (!result) {
                    return next(
                        ApiError.badRequest('Error: Array contains invalid number(s).')
                    );
                }
            }

            const room = await Rooms.findOne({
                where: {
                    status: 'active',
                    id: room_id,
                },
            });

            if (!room) {
                return next(ApiError.badRequest('no data found'));
            }

            if (!time) {
                return next(ApiError.badRequest('data is incomplete'));
            }
            const lessonGroupOne = await LessonGroup.findOne({
                where: {
                    group_id: id,
                    status: 'active',
                },
            });

            await GroupSchedule.destroy({
                where: {
                    status: 'active',
                    group_id: id,
                },
            });


            let resAllTime = false;
            for (const weekDay of day) {
                const groupSchedule = await GroupSchedule.findAll({
                    where: {
                        status: 'active',
                        day_of_week: weekDay,
                        room_id,
                    },
                });
                let resTime = false;
                if (groupSchedule && groupSchedule.length > 0) {
                    for (const data of groupSchedule) {
                        const timeFunRes = timeFun(data.lesson_time, time);
                        if (!timeFunRes) {
                            resTime = true;
                            break;
                        }
                    }
                }
                if (resTime) {
                    resAllTime = true;
                    break;
                }
            }
            if (resAllTime) {
                return next(
                    ApiError.badRequest('At this time there is a lesson in the room')
                );
            }

            const groupScheduleAll = [];
            for (const weekDay of day) {
                const groupScheduleOne = await GroupSchedule.create({
                    room_id,
                    lesson_time: time,
                    group_id: id,
                    day_of_week: weekDay,
                    teacher_id,
                });
                if (groupScheduleOne) {
                    groupScheduleAll.push(groupScheduleOne.day_of_week);
                }
            }

            if (lessonGroupOne) {
                lessonGroupOne.room_id = room_id;
                lessonGroupOne.lesson_time = time;
                lessonGroupOne.lesson_day = groupScheduleAll.join(',');
                lessonGroupOne.teacher_id = teacher_id;
                await lessonGroupOne.save();
            } else {
                await LessonGroup.create({
                    room_id,
                    lesson_time: time,
                    group_id: id,
                    lesson_day: groupScheduleAll.join(','),
                    teacher_id,
                });
            }
            if (month_payment) {
                groupById.month_payment = month_payment;
            }
            const teacherGroupOne = await TeacherGroups.findOne({
                where: { status: 'active', group_id: id },
            });



            if (teacherGroupOne && teacher_id != teacherGroupOne?.teacher_id) {
                teacherGroup = await TeacherGroups.update(
                    { status: 'inactive' },
                    { where: { status: 'active', group_id: id } }
                );
                createTeacher = await TeacherGroups.create({
                    teacher_id: teacher_id,
                    group_id: id,
                });
            } else if (!teacherGroupOne) {
                createTeacher = await TeacherGroups.create({
                    teacher_id: teacher_id,
                    group_id: id,
                });
            }

            if (!groupById) {
                return next(ApiError.badRequest(`Ushbu idli o'quvchi topilmadi`));
            }
            const groupUpdate = await groupById.save();
            if (!groupUpdate) {
                return next(
                    ApiError.badRequest(
                        `Ush bu ${id} id tegishli malumotlarni o'zgartirib bo'lmadi`
                    )
                );
            };
            const text = `${groupById.name} guruhni malumotlarni o'zgartirildi`;
            await logSystemController.logsAdd({ reqdata: req, text });
            res.json({ groupUpdate, teacherGroup, createTeacher, groupStudent });
        } catch (error) {
            console.log(374, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async groupLessonPut(req, res, next) {
        try {
            let createTeacher;
            let teacherGroup;
            const { id } = req.params;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            };
            const {
                name,
                teacher_id,
                month_payment,
                sale,
                month_pay_intrue,
                week_data,
            } = req.body;
            if (!teacher_id || !validateFun.isValidUUID(teacher_id)) {
                return next(ApiError.badRequest("Teacher_id topilmadi"));
            }
            const groupById = await Groups.findOne({
                where: { id, status: 'active' },
            });
            const groupStudent = month_pay_intrue
                ? await GroupStudents.update(
                    { month_payment: month_payment },
                    {
                        where: {
                            status: 'active',
                            group_id: id,
                        },
                    }
                )
                : {};

            if (sale < 0 || 100 < sale) {
                return next(ApiError.badRequest('Re-enter the teacher percentage'));
            }

            if (name) {
                groupById.name = name;
            }
            if (sale) {
                groupById.sale = sale;
            }
            const lessonGroupOne = await LessonGroup.findOne({
                where: {
                    group_id: id,
                    status: 'active',
                },
            });
            await GroupSchedule.destroy({
                where: {
                    status: 'active',
                    group_id: id,
                },
            });

            if (!week_data || week_data.length <= 0) {
                return next(
                    ApiError.badRequest('There is an error in the weekly data')
                );
            }
            const resWeekData = CountWeekdays.validateWeekData(week_data);
            if (resWeekData) {
                return next(
                    ApiError.badRequest('There is an error in the weekly data')
                );
            }

            let resAllTime = false;
            for (const data of week_data) {
                const groupSchedule = await GroupSchedule.findAll({
                    where: {
                        status: 'active',
                        day_of_week: data.week_day,
                        room_id: data.room_id,
                    },
                });

                let resTime = false;
                if (groupSchedule && groupSchedule.length > 0) {
                    for (const groupScheduleData of groupSchedule) {
                        const timeFunRes = timeFun(
                            groupScheduleData.lesson_time,
                            data.time
                        );
                        if (!timeFunRes) {
                            resTime = true;
                            break;
                        }
                    }
                }
                if (resTime) {
                    resAllTime = true;
                    break;
                }
            }
            if (resAllTime) {
                return next(
                    ApiError.badRequest('At this time there is a lesson in the room')
                );
            }

            const groupScheduleAll = [];
            for (const data of week_data) {
                const groupScheduleOne = await GroupSchedule.create({
                    room_id: data.room_id,
                    lesson_time: data.time,
                    group_id: id,
                    day_of_week: data.week_day,
                    teacher_id,
                });
                if (groupScheduleOne) {
                    groupScheduleAll.push(groupScheduleOne.day_of_week);
                }
            }

            if (lessonGroupOne) {
                lessonGroupOne.room_id = '';
                lessonGroupOne.lesson_time = '';
                lessonGroupOne.lesson_day = groupScheduleAll.join(',');
                lessonGroupOne.teacher_id = teacher_id;
                await lessonGroupOne.save();
            } else {
                await LessonGroup.create({
                    group_id: id,
                    lesson_day: groupScheduleAll.join(','),
                    teacher_id,
                });
            }
            if (month_payment) {
                groupById.month_payment = month_payment;
            }
            const teacherGroupOne = await TeacherGroups.findOne({
                where: { status: 'active', group_id: id },
            });

            if (teacherGroupOne && teacher_id != teacherGroupOne.teacher_id) {
                teacherGroup = await TeacherGroups.update(
                    { status: 'inactive' },
                    { where: { status: 'active', group_id: id } }
                );
                createTeacher = await TeacherGroups.create({
                    teacher_id: teacher_id,
                    group_id: id,
                });
            }

            if (!groupById) {
                return next(ApiError.badRequest(`Ushbu idli o'quvchi topilmadi`));
            }
            const groupUpdate = await groupById.save();
            if (!groupUpdate) {
                return next(
                    ApiError.badRequest(
                        `Ush bu ${id} id tegishli malumotlarni o'zgartirib bo'lmadi`
                    )
                );
            }
            const text = `${groupById.name} guruhni malumotlarni o'zgartirildi`;
            await logSystemController.logsAdd({ reqdata: req, text });
            res.json({ groupUpdate, teacherGroup, createTeacher, groupStudent });
        } catch (error) {
            console.log(374, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async groupGet(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            };

            const groups = await Groups.findAll({ where: { status: 'active' } });
            const teachers = await Teachers.findOne({
                where: { status: 'active', id, job_type: 'teacher' },
            });
            const teacherGroup = await TeacherGroups.findAll({
                where: { status: 'active', teacher_id: id },
            });

            let groupListData = [];
            if (groups && teacherGroup && teachers) {
                groupListData = teacherGroup
                    .map((el) => {
                        const groupOne = groups.find((e) => e.id == el.group_id);
                        return (
                            groupOne && {
                                id: groupOne.id,
                                name: groupOne.name,
                                count_students: groupOne.count_students
                                    ? groupOne.count_students
                                    : '0',
                                month_payment: groupOne.month_payment
                                    ? groupOne.month_payment
                                    : '0',
                            }
                        );
                    })
                    .filter((e) => e && e);
            }
            const teacherData = {
                name: teachers.lastname + ' ' + teachers.firstname,
            };

            const groupList =
                groupListData &&
                groupListData.sort((a, b) => a.name.localeCompare(b.name));

            return res.json({ groupList, teacherData });
        } catch (error) {
            return next(ApiError.badRequest(`${error}, group get`));
        }
    }

    async groupGetNew(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            };

            const query = `SELECT json_build_object(
                'id', t.id,
                'firstname', t.firstname,
                'lastname', t.lastname,
                'groups', CASE
                    WHEN MAX(tg.status) = 'active' THEN COALESCE(json_agg(json_build_object('id', g.id, 'name', g.name, 'count_students', g.count_students, 'month_payment', g.month_payment)), '[]'::json)
                    ELSE '[]'::json
                END
            ) AS reader_info
            FROM teachers t
            LEFT JOIN teacher_groups tg ON t.id::VARCHAR(255) = tg.teacher_id::VARCHAR(255)
            LEFT JOIN groups g ON tg.group_id::VARCHAR(255) = g.id::VARCHAR(255)
            WHERE t.id::VARCHAR(255) = '${id}'
                AND t.status = 'active'
            GROUP BY t.id, t.firstname, t.lastname;
            `
            const data = await sequelize.query(query);
            if (data && data.length > 0 && data[0] && data[0].length > 0 && data[0][0]?.reader_info) {
                const groups = data[0][0]?.reader_info?.groups && data[0][0]?.reader_info?.groups.length > 0 ? data[0][0]?.reader_info.groups : []
                const resData = {
                    teacherData: {
                        name: data[0][0]?.reader_info.firstname + ' ' + data[0][0]?.reader_info.lastname
                    },
                    groupList: groups && groups.length > 0 ? groups.sort((a, b) => a.name.localeCompare(b.name)) : []
                }
                return res.json(resData)
            } else {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            }


        }
        catch (error) {
            console.log(887, error.stack);
            return next(
                ApiError.badRequest(error)
            )
        }
    }

    async groupTeacherGet(req, res, next) {
        try {
            const teachers = await Teachers.findAll({
                where: {
                    status: 'active',
                    job_type: 'teacher',
                },
            });

            const teacherGroup = await TeacherGroups.findAll({
                where: {
                    status: 'active',
                },
            });

            const groups = await Groups.findAll({ where: { status: 'active' } });

            let dataGroup = [];
            groups &&
                groups.forEach((el) => {
                    const teacherGroupOne = teacherGroup.find((e) => el.id == e.group_id);
                    const teacherOne =
                        teacherGroupOne &&
                        teachers.find((e) => e.id == teacherGroupOne.teacher_id);
                    if (!teacherOne) {
                        const data = {
                            id: el.id,
                            name: el.name,
                            count_students: el.count_students ? el.count_students : '0',
                            month_payment: el.month_payment ? el.month_payment : '0',
                        };
                        dataGroup.push(data);
                    }
                });

            let groupList =
                dataGroup && dataGroup.sort((a, b) => a.name.localeCompare(b.name));
            const teacherGroupList = teachers
                .map((el) => {
                    const groups =
                        teacherGroup && teacherGroup.filter((e) => e.teacher_id == el.id);
                    return {
                        id: el.id,
                        name: el.firstname + ' ' + el.lastname + ' ',
                        phone: el.phone,
                        groups_count: groups && groups.length,
                    };
                })
                .sort((a, b) => a.name.localeCompare(b.name));

            return res.json({ teacherGroupList, groupList });
        } catch (error) {
            console.log(236, error.stack);
            console.log(236, error);
            return next(ApiError.badRequest(error));
        }
    }
    async groupGetOne(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            };
            const teacherGroup = await TeacherGroups.findOne({
                where: { status: 'active', group_id: id },
            });
            const groups = await Groups.findOne({
                where: { id, status: 'active' },
            });

            const lesson_group = await LessonGroup.findOne({
                where: {
                    status: 'active',
                    group_id: id,
                },
            });

            const groupSchedule = await GroupSchedule.findAll({
                where: {
                    status: 'active',
                    group_id: id,
                },
            });

            const groupsList = {
                name: groups.name,
                teacher_id: teacherGroup?.teacher_id ? teacherGroup?.teacher_id : '',
                id: groups.id,
                month_payment: groups.month_payment,
                count_students: groups.count_students,
                sale: groups.sale,
                lesson_group:
                    lesson_group &&
                    lesson_group.lesson_time &&
                    lesson_group.room_id &&
                    lesson_group,
                groupSchedule:
                    lesson_group && lesson_group.lesson_time && lesson_group.room_id
                        ? []
                        : groupSchedule,
            };

            return res.json(groupsList);
        } catch (error) {
            console.log(1040, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async groupGetOneLesson(req, res, next) {
        try {
            const { id } = req.body;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            } else {
                const groups = await Groups.findOne({
                    where: {
                        status: 'active',
                        id
                    }
                })
                if (!groups) {
                    return next(
                        ApiError.badRequest('Group not found')
                    )
                }

            };

            const day = new Date().getDay();
            const groupSchedule = await GroupSchedule.findOne({
                where: {
                    status: 'active',
                    group_id: id,
                    day_of_week: day
                },
            });

            if (groupSchedule) {
                return res.json({ lesson: true });
            } else {
                return res.json({ lesson: false });
            }
        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }

    // attendance

    async groupAttendansiOneCron(req, res, next) {
        try {
            const week = new Date().getDay();
            const year = new Date().getFullYear();
            const month = new Date().getMonth() + 1;
            const day = new Date().getDate();
            const query = `SELECT
                           g.id AS group_id,
                            g.name AS group_name,
                            g.status AS group_status,
                            gsched.day_of_week,
                            (
                                SELECT JSON_AGG(
                                    json_build_object(
                                        'student_id', s.id,
                                        'firstname', s.firstname,
                                        'lastname', s.lastname,
                                        'status', s.status,
                                        'gs_status', gs.status
                                    )
                                )
                                FROM students AS s
                                JOIN group_students AS gs ON gs.student_id::VARCHAR(255) = s.id::VARCHAR(255)
                                WHERE gs.group_id::VARCHAR(255) = g.id::VARCHAR(255)
                                AND s.status = 'active'
                            ) AS students
                        FROM
                            groups AS g
                        JOIN
                            group_schedules AS gsched ON g.id::VARCHAR(255) = gsched.group_id::VARCHAR(255)
                        WHERE
                        gsched.status = 'active'
                        AND gsched.day_of_week = '${week}';
  `;

            const data = await sequelize.query(query)
            if (data && data.length > 0 && data[0].length > 0) {
                for (const el of data[0]) {
                    const attendansi = await Attendansi.create({
                        group_id: el.group_id,
                        date: year + '-' + (month <= 9 ? '0' + month : month) + '-' + (day <= 9 ? '0' + day : day),
                        in_attendansi: false
                    });

                    if (el?.students) {
                        for (const student of el.students) {
                            await AttendansiStudent.create({
                                student_id: student.student_id,
                                attendan_id: attendansi.id,
                                attendan_student_status: student.gs_status == 'frozen' ? 'frozen' : 'came',
                                comment: '',
                                group_id: el.group_id,
                                date: year + '-' + (month <= 9 ? '0' + month : month) + '-' + (day <= 9 ? '0' + day : day),
                            })
                        }
                    }
                }
            };

            // res.send('Add attendansi');
           return 'Add attendansi'

        } catch (error) {
            console.log(921, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async groupAttendansi(req, res, next) {
        try {
            const { group_id, students, date } = req.body;
            if (!date || !validateFun.isToday(date)) {
                return next(
                    ApiError.badRequest(
                        'The date value is incorrect, please check and re-enter'
                    )
                );
            }
            if (!group_id || !validateFun.isValidUUID(group_id)) {
                return next(ApiError.badRequest('group not found'));
            }

            if (students) {
                const type = typeof students;
                if (type == 'object') {
                    if (students.length > 0) {
                        for (const data of students) {
                            const id = data?.id;
                            const status = data?.status;
                            // came // notCome // it'sLate
                            if (id) {
                                if (!validateFun.isValidUUID(id)) {
                                    return next(
                                        ApiError.badRequest(
                                            'There is an error in the data, please correct it and re-enter it'
                                        )
                                    );
                                }
                            } else {
                                return next(
                                    ApiError.badRequest(
                                        'There is an error in the data, please correct it and re-enter it'
                                    )
                                );
                            }

                            const allowedValues = ['came', 'notCome', "it'sLate", "frozen"];

                            if (!allowedValues.includes(status)) {
                                return next(
                                    ApiError.badRequest(
                                        'There is an error in the data, please correct it and re-enter it'
                                    )
                                );
                            }
                        }
                    } else {
                        return next(ApiError.badRequest('The data is incomplete'));
                    }
                } else {
                    return next(ApiError.badRequest('Reference type error'));
                }
            } else {
                return next(ApiError.badRequest('The data type value is incorrect'));
            }

            const studentFilter = students.filter((el) => el.group_student_status == 'test');
            if (studentFilter && studentFilter.length > 0) {
                for (const data of studentFilter) {
                    const allowedValues = ['came', "it'sLate",];
                    if (allowedValues.includes(data.status)) {
                        const group_student = await GroupStudents.findOne({
                            where: {
                                group_id,
                                status: 'test',
                                student_id: data.id
                            }
                        });
                        if (group_student) {
                            let conunt = group_student.status_count - 1;
                            if (conunt == 0) {
                                group_student.status_count = 0;
                                group_student.status = 'active';
                                await group_student.save();
                                await groupStudentCreate({
                                    student_id: data.id,
                                    summa: group_student.month_payment,
                                    group_id,
                                    in_time: true
                                });

                            } if (conunt == 1) {
                                group_student.status_count = 1;
                                await group_student.save();
                            }
                        }
                    }
                }
            }

            const attendansi = await Attendansi.findOne({
                where: {
                    group_id,
                    date: date,
                    status: 'active',
                },
            });

            if (!attendansi) {
                return next(
                    ApiError.badRequest('There are no lessons in this group today')
                )
            }

            if (attendansi && !attendansi.in_attendansi) {
                attendansi.in_attendansi = true;
                attendansi.in_attendansi_send_message = false;
                await attendansi.save()

                await AttendansiStudent.destroy({
                    where: {
                        status: 'active',
                        attendan_id: attendansi.id,
                    },
                });

                for (const data of students) {
                    await AttendansiStudent.create({
                        student_id: data.id,
                        attendan_id: attendansi.id,
                        attendan_student_status: data.status,
                        comment: data.comment ? data.comment : '',
                        group_id,
                        date: date,
                    });
                }
            }


            res.json(attendansi);
        } catch (error) {
            console.log(921, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async groupAttendansiUpdate(req, res, next) {
        try {
            const role = jwt.verify(
                req.headers.authorization.split(' ')[1],
                process.env.SECRET_KEY
            );
            if (role.role == 'super' || role.role == 'admin' || role.role == "USER") {
                const { group_id, students, date } = req.body;
                if (!date || !validateFun.isToday_2(date)) {
                    return next(
                        ApiError.badRequest(
                            'The value in date was entered incorrectly'
                        )
                    );
                }
                if (!group_id || !validateFun.isValidUUID(group_id)) {
                    return next(ApiError.badRequest('group not found'));
                }
                if (students) {
                    const type = typeof students;
                    if (type == 'object') {
                        if (students.length > 0) {
                            for (const data of students) {
                                const id = data?.id;
                                const status = data?.status;
                                if (id) {
                                    if (!validateFun.isValidUUID(id)) {
                                        return next(
                                            ApiError.badRequest(
                                                'There is an error in the data, please correct it and re-enter it'
                                            )
                                        );
                                    }
                                } else {
                                    return next(
                                        ApiError.badRequest(
                                            'There is an error in the data, please correct it and re-enter it'
                                        )
                                    );
                                }

                                const allowedValues = ['came', 'notCome', "it'sLate", "frozen"];
                                if (!allowedValues.includes(status)) {
                                    return next(
                                        ApiError.badRequest(
                                            'There is an error in the data, please correct it and re-enter it'
                                        )
                                    );
                                }
                            }
                        } else {
                            return next(ApiError.badRequest('The data is incomplete'));
                        }
                    } else {
                        return next(
                            ApiError.badRequest('The data type value is incorrect')
                        );
                    }
                } else {
                    return next(ApiError.badRequest('The data type value is incorrect'));
                }
                const attendansi = await Attendansi.findOne({
                    where: {
                        group_id,
                        date: date,
                        status: 'active',
                    },
                });

                if (!attendansi) {
                    return next(
                        ApiError.badRequest("No data found")
                    )
                }

                await AttendansiStudent.destroy({
                    where: {
                        status: 'active',
                        attendan_id: attendansi.id,
                    },
                });
                attendansi.in_attendansi_send_message = false;
                await attendansi.save()

                for (const data of students) {
                    await AttendansiStudent.create({
                        student_id: data.id,
                        attendan_id: attendansi.id,
                        attendan_student_status: data.status,
                        comment: data.comment ? data.comment : '',
                        group_id,
                        date: date,
                    });
                }
                return res.json(attendansi);
            } else {
                return res.send('Changing user data is not allowed');
            }
        } catch (error) {
            console.log(1209, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async groupAttendansiGet(req, res, next) {
        try {
            const { group_id, date } = req.body;
            if (!date || !validateFun.isToday_2(date)) {
                return next(
                    ApiError.badRequest(
                        'The value in date was entered incorrectly'
                    )
                );
            }
            if (!group_id || !validateFun.isValidUUID(group_id)) {
                return next(ApiError.badRequest('group not found'));
            } else {
                const group = await Groups.findOne({
                    where: { status: "active", id: group_id },
                });
                if (!group) {
                    return next(ApiError.badRequest('group not found')); s
                }
            }

            const attendansi = await Attendansi.findOne({
                where: {
                    group_id,
                    date,
                },
            });

            const attendan_student = attendansi && await AttendansiStudent.findAll({
                where: {
                    status: 'active',
                    attendan_id: attendansi.id,
                },
            });

            const groupStudent = await GroupStudents.findAll({
                where: {
                    [Op.or]: [
                        { status: "active" },
                        { status: "frozen" }, // Replace 'another_status' with the second status you want to query
                        { status: "test" }, // Replace 'another_status' with the second status you want to query
                    ], group_id: group_id
                },
            });

            const students = [];
            let teacher_update = true;

            if (attendansi && groupStudent && groupStudent.length > 0) {
                teacher_update = attendansi.in_attendansi ? false : true;
                for (const data of groupStudent) {

                    const student = await Students.findOne({
                        where: {
                            status: "active",
                            id: data.student_id
                        }
                    });
                    const attendan_studentOne = attendan_student.find((el, i) => {
                        return el.student_id == data.student_id
                    });
                    if (student) {
                        students.push({
                            id: data.student_id,
                            name: student.firstname + ' ' + student.lastname,
                            comment: attendan_studentOne?.comment ? attendan_studentOne?.comment : '',
                            status: attendan_studentOne ? attendan_studentOne.attendan_student_status : 'came',
                            groupStudentStatus: data?.status
                        })

                    }

                }
            }

            const data = {
                date: date,
                group_id,
                teacher_update,
                students: students.sort((a, b) => a.name.localeCompare(b.name)),
            };

            return res.json(data);
        } catch (error) {
            console.log(1098, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async groupAttendansiAllData(req, res, next) {
        try {
            const { group_id, date } = req.body;

            if (!group_id || !validateFun.isValidUUID(group_id)) {
                return next(ApiError.badRequest('group not found'));
            } else {
                const group = await Groups.findOne({
                    where: { status: "active", id: group_id },
                });
                if (!group) {
                    return next(ApiError.badRequest('group not found')); s
                }
            }

            const lessonGroupOne = await LessonGroup.findOne({
                where: {
                    status: 'active',
                    group_id
                }
            });



            const group_student = await GroupStudents.findAll({
                where: {
                    [Op.or]: [
                        { status: "active" },
                        { status: "frozen" }, // Replace 'another_status' with the second status you want to query
                        { status: "test" }, // Replace 'another_status' with the second status you want to query
                    ],
                    group_id
                }
            });

            const students = []
            if (group_student && group_student.length > 0) {
                for (const el of group_student) {
                    const student = await Students.findOne({
                        where: {
                            status: 'active',
                            id: el.student_id
                        }
                    })
                    if (student) {
                        students.push(student)
                    }
                }
            }


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
            const sendData = []
            if (data && data.length > 0) {
                for (const el of data[0]) {
                    sendData.push(el.data)
                }
            }

            const studentResult = []
            if (students && students.length > 0 && data && data.length > 0) {
                students.forEach((el) => {
                    const newData = data[0].map((e) => {
                        const studentOneData = e.data.attendance_students.find((ele) => ele.student_id == el.id);
                        return studentOneData && {
                            id: e.data.attendance_id,
                            date: e.data.attendance_date,
                            status: studentOneData?.attendance_student_status ? studentOneData?.attendance_student_status : '',
                            comment: studentOneData?.attendance_student_comment ? studentOneData?.attendance_student_comment : '',
                            attendance_student_id: studentOneData?.attendance_student_id ? studentOneData?.attendance_student_id : '',
                        }
                    }).filter((e) => e && e)
                    studentResult.push({
                        id: el.id,
                        lastname: el.lastname,
                        firstname: el.firstname,
                        data: newData.sort((a, b) => {
                            return new Date(a.date) - new Date(b.date);
                        })
                    })
                })
            }

            const result = sendData.sort((a, b) => {
                return new Date(a.attendance_date) - new Date(b.attendance_date);
            });



            return res.json({ result, studentResult });
        } catch (error) {
            console.log(1098, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async groupAttendansiOneCron_2() {
        try {
            const year = new Date().getFullYear();
            const month = new Date().getMonth() + 1;
            const day = new Date().getDate();
            const weekDay = new Date().getDay();
            const date = year + '-' + (month <= 9 ? '0' + month : month) + '-' + (day <= 9 ? '0' + day : day);
            const attendansi = await Attendansi.findAll({
                where: {
                    date: date,
                    status: 'active',
                    in_attendansi_send_message: true
                },
            });

            const groupSchedule = await GroupSchedule.findAll({
                where: {
                    status: 'active',
                    day_of_week: weekDay
                }
            });

            const user = await User.findAll({
                where: {
                    status: 'active',
                    [Op.or]: [
                        { role: 'admin' },
                        { role: 'super' },
                    ]

                }
            });

            const time = (new Date().getHours() <= 9 ? "0" : '') + '' + new Date().getHours() + ':'
                + (new Date().getMinutes() <= 9 ? "0" : '') + '' + new Date().getMinutes() + ':' + '00';


            if (groupSchedule && groupSchedule.length > 0 && attendansi && attendansi.length > 0) {
                const data = groupSchedule.filter((el) => {
                    const [startTime, endTime] = el.lesson_time.split('-');
                    const w = new Date(`2023-09-23T${time}`);
                    const end = new Date(`2023-09-23T${endTime}`);
                    const start = new Date(`2023-09-23T${startTime}`);
                    return start < w && w <= end
                });
                for (const value of attendansi) {
                    const attendansiOne = data.find((el) => el.group_id == value.group_id);
                    if (attendansiOne) {
                        const group = await Groups.findOne({
                            where: {
                                status: 'active',
                                id: value.group_id
                            }
                        });
                        const sendText = group && `${group.name} guruhga bugun davomat qilinmadi.`;
                        for (const dataValue of user) {
                            if (sendText && dataValue.telegram_id) {
                                telegramBot.sendMessage(sendText, dataValue.telegram_id);
                            }

                        }
                        value.update({
                            in_attendansi_send_message: false
                        })

                    }
                }
            };



            return 'send message'
        } catch (error) {
            console.log(1454, error.stack);
            return error
        }
    }


}

module.exports = new GroupsController();
