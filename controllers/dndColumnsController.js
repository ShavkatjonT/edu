const {
    DndColumns,
    Students,
    StudentPending,
    GroupSchedule,
    LessonGroup,
    GroupStudents,
    Groups,
    PendingGroups,
    TeacherGroups,
    Teachers,
    Rooms,
    Messages,
    Attendansi,
    AttendansiStudent,
    TeacherStatistics
} = require("../models/models");
const validateFun = require("./validateFun");
const ApiError = require("../error/ApiError");
const groupStudentCreate = require('./groupStudentCreate');
const timeFun = require('./timeFun');
const CountWeekdays = require('./countWeekdays')
const sendMessage = require("./sendMessageController");
const logSystemController = require("./logSystemController");

function compareDatesDescending(a, b) {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateA - dateB;
}
class ColumsController {
    async columsAdd(req, res, next) {
        try {
            const { name } = req.body;
            let columsData = await DndColumns.findAll({
                where: {
                    status: 'active'
                }
            });
            columsData.sort(compareDatesDescending);
            const lastElement = columsData[columsData.length - 1];
            const colums = await DndColumns.create({
                name,
                items: '',
                order: lastElement ? lastElement.order + 1 : 1,
            });
            const text = `${name} lid yaratildi`;
            await logSystemController.logsAdd({ reqdata: req, text });
            return res.json(colums);
        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }
    async columsDelete(req, res, next) {
        try {
            const { id } = req.body;

            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('No data found')
                );
            } else {
                const columnsDefault = await DndColumns.findOne({
                    where: {
                        order: 1,
                        status: "active",
                    },
                });
                if (id == columnsDefault.id) {
                    return next(
                        ApiError.badRequest('No data found')
                    );
                }
            }
            const columnsDelete = await DndColumns.findOne({
                where: {
                    id,
                    status: "active",
                },
            });

            if (!columnsDelete) {
                return next(
                    ApiError.badRequest('No data found')
                );
            }


            const columnsDefault = await DndColumns.findOne({
                where: {
                    order: 1,
                    status: "active",
                },
            });
            if (columnsDelete?.items) {
                const data1 = columnsDelete.items.split(',').filter((el) => el && el);
                const data2 = columnsDefault.items.split(',').filter((el) => el && el);
                const data3 = data2.concat(data1).join(',');
                columnsDefault.items = data3;
                await columnsDefault.save();
            }
            columnsDelete.status = "inactive";
            await columnsDelete.save();
            const text = `${columnsDelete.name} lid o'chririldi`;
            await logSystemController.logsAdd({ reqdata: req, text });
            return res.send('Delete column');
        } catch (error) {
            console.log(73, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async columsUpdateName(req, res, next) {
        try {
            const { id, name } = req.body;

            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('No data found')
                )
            }

            if (!name) {
                return next(
                    ApiError.badRequest('Name not found')
                )
            }

            const columns = await DndColumns.findOne({
                where: {
                    id,
                    status: "active",
                },
            });
            if (!columns) {
                return next(
                    ApiError.badRequest('No data found')
                )
            }
            const text = `${columns.name} lid nomi o'zgartirildi`;
            await logSystemController.logsAdd({ reqdata: req, text });

            columns.name = name;
            await columns.save();

            return res.send('Columns update name');
        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }
    async columsPut(req, res, next) {
        try {
            const { result } = req.body;
            const columnsStart = await DndColumns.findOne({
                where: {
                    id: result.source.droppableId,
                    status: "active",
                },
            });
            const columnsEnd = await DndColumns.findOne({
                where: {
                    id: result.destination.droppableId,
                    status: "active",
                },
            });

            const student = await StudentPending.findOne({
                where: {
                    status: 'active',
                    id: result.draggableId
                }
            });
            let upData = columnsStart.items.split(',');
            upData.splice(upData.indexOf(result.draggableId), 1);

            columnsStart.items = upData.join(',');
            let endData = columnsEnd.items.split(',')
            const resultData = [...endData, result.draggableId]
            const resultDataFilter = resultData.filter((el) => el && el);
            columnsEnd.items = resultDataFilter.join(',');
            if (student) student.group_id = result.destination.droppableId;
            if (student) await student.save();
            await columnsEnd.save();
            await columnsStart.save();
            return res.json(result);
        } catch (error) {
            console.log(127, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async columsGet(req, res, next) {
        try {
            const colums = await DndColumns.findAll({
                where: {
                    status: "active",
                },
            });
            const items = await StudentPending.findAll({
                where: {
                    status: "active",
                },
            });
            const sortData = colums && colums.sort((a, b) => {
                return a.order - b.order;
            });

            let columnsData = {};
            items && colums.length > 0 && sortData.forEach((el) => {
                let itemsOne = [];
                el.items && el.items.split(',').forEach((e) => {
                    const data = items && items.find((value) => e == value.id);
                    itemsOne.push(data);
                    return;
                });
                columnsData[el.id] = {
                    order: el.order,
                    name: el.name,
                    id: el.id,
                    items: itemsOne && itemsOne,
                };
                return;
            });
            let defaultItem = [];
            colums.length > 0 && sortData[0]?.items && sortData[0]?.items.split(',').forEach((e) => {
                const data = items && items.find((value) => e == value.id);
                defaultItem.push(data);
            });
            const defaultData = sortData[0] && {
                id: sortData[0].id,
                name: sortData[0].name,
                items: defaultItem && defaultItem.length > 0 && defaultItem,
                order: sortData[0].order,
            };
            return res.json({ columnsData, defaultData });
        } catch (error) {
            console.log(129, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async columnStartGruopLesson_1(req, res, next) {
        try {
            const { column_id, name, month_payment, sale, teacher_id, week_data } = req.body;
            console.log(243);
            if (!column_id || !validateFun.isValidUUID(column_id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            } else {
                const pendingGroup = await DndColumns.findOne({
                    where: {
                        id: column_id,
                        status: 'active'
                    }
                });
                if (1 == pendingGroup.order) {
                    return next(
                        ApiError.badRequest('There is an error in the data')
                    )
                }

            }
            if (!teacher_id || !validateFun.isValidUUID(teacher_id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            }
            if (!name) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            }
            if (!month_payment) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            }

            if (!sale) {
                return next(
                    ApiError.badRequest("data is incomplete")
                )
            } else if (sale < 0 || 100 < sale) {
                return next(
                    ApiError.badRequest('Re-enter the teacher percentage')
                )
            }
            if (!week_data || week_data.length <= 0) {
                return next(
                    ApiError.badRequest('There is an error in the weekly data')
                )
            }

            const resWeekData = CountWeekdays.validateWeekData(week_data);
            if (resWeekData) {
                return next(
                    ApiError.badRequest('There is an error in the weekly data')
                )
            }
            let resAllTime = false;
            for (const data of week_data) {
                const groupSchedule = await GroupSchedule.findAll({
                    where: {
                        status: 'active',
                        day_of_week: data.week_day,
                        room_id: data.room_id
                    }
                });
                let resTime = false
                if (groupSchedule && groupSchedule.length > 0) {
                    for (const groupScheduleData of groupSchedule) {
                        const timeFunRes = timeFun(groupScheduleData.lesson_time, data.time);
                        if (!timeFunRes) {
                            resTime = true
                            break;
                        }
                    }
                }
                if (resTime) {
                    resAllTime = true
                    break;
                }

            }
            if (resAllTime) {
                return next(
                    ApiError.badRequest("At this time there is a lesson in the room")
                );
            }

            const day_seond = new Date().getDate();

            const pendingGroup = await DndColumns.findOne({
                where: {
                    id: column_id,
                    status: 'active'
                }
            });

            if (!pendingGroup) {
                return next(
                    ApiError.badRequest("pendingGroup not found")
                );
            };

            const pendingStudent = await StudentPending.findAll({
                where: {
                    status: 'active',
                    group_id: column_id
                }
            });

            const groupScheduleAll = []
            for (const data of week_data) {
                const groupScheduleOne = await GroupSchedule.create({
                    room_id: data.room_id,
                    lesson_time: data.time,
                    group_id: column_id,
                    day_of_week: data.week_day,
                    teacher_id,
                });
                if (groupScheduleOne) {
                    groupScheduleAll.push(groupScheduleOne.day_of_week)
                }
            };

            await LessonGroup.create({
                group_id: column_id,
                lesson_day: groupScheduleAll.join(','),
                teacher_id
            });

            const group = await Groups.create({
                id: column_id,
                name,
                month_payment,
                sale,
                count_students: pendingGroup.items.split(',').length
            });
            let attendan = false
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
                    attendan = await Attendansi.create({
                        group_id: group.id,
                        date: year + '-' + (month <= 9 ? '0' + month : month) + '-' + (day <= 9 ? '0' + day : day),
                        in_attendansi: false
                    })
                };
            }
            await TeacherGroups.create({
                teacher_id,
                group_id: column_id
            });

            if (pendingStudent) {
                const student_id_list = pendingStudent.map((el) => el.id);
                if (student_id_list && student_id_list.length > 0) {
                    const s_length = pendingGroup.items.split(',').length;
                    const id_list = student_id_list.join(',');
                    const teacherStatistics = await TeacherStatistics.create({
                        group_id: column_id,
                        student_id: id_list,
                        student_status: 'add',
                        student_count: s_length,
                        teacher_id: teacher_id ? teacher_id : ''
                    })
                }
            }

            if (pendingStudent) {
                for (let studentsData of pendingStudent) {
                    await Students.create({
                        id: studentsData.id,
                        firstname: studentsData?.firstname ? studentsData?.firstname : '',
                        gender: studentsData?.gender ? studentsData?.gender : '',
                        birthday: studentsData?.birthday ? studentsData?.birthday : '',
                        lastname: studentsData?.lastname ? studentsData?.lastname : '',
                        fathername: studentsData?.fathername ? studentsData?.fathername : '',
                        address: studentsData?.address ? studentsData?.address : '',
                        fatherPhone: studentsData?.fatherPhone ? studentsData?.fatherPhone : '',
                        motherPhone: studentsData?.motherPhone ? studentsData?.motherPhone : '',
                        science: [],
                        class: studentsData?.class ? studentsData?.class : ''
                    });
                    await GroupStudents.create({
                        student_id: studentsData.id,
                        group_id: column_id,
                        month_payment
                    });
                    await groupStudentCreate({ student_id: studentsData.id, group_id: column_id, summa: month_payment, day: day_seond, in_stat: false });
                    if (attendan) {
                        const year = new Date().getFullYear();
                        const month = new Date().getMonth() + 1;
                        const day = new Date().getDate();
                        await AttendansiStudent.create({
                            student_id: studentsData.id,
                            attendan_id: attendan.id,
                            attendan_student_status: 'came',
                            comment: '',
                            group_id: group.id,
                            date: year + '-' + (month <= 9 ? '0' + month : month) + '-' + (day <= 9 ? '0' + day : day),
                        })
                    }

                }
            };

            const text = `${pendingGroup.name} nomli lid guruhga aylantirib ishga tushurildi`;
            await logSystemController.logsAdd({ reqdata: req, text });

            await DndColumns.destroy({
                where: {
                    status: 'active',
                    id: column_id
                }
            });

            await StudentPending.update({
                status: 'inactive'
            }, {
                where: {
                    status: 'active',
                    group_id: column_id
                }
            });






            return res.send('A new group was created');

        } catch (error) {
            console.log(209, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async columnStartGruopLesson_2(req, res, next) {
        try {
            const { column_id, name, month_payment, sale, teacher_id, time, day, room_id, } = req.body;

            if (!column_id || !validateFun.isValidUUID(column_id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            } else {
                const pendingGroup = await DndColumns.findOne({
                    where: {
                        id: column_id,
                        status: 'active'
                    }
                });
                if (1 == pendingGroup.order) {
                    return next(
                        ApiError.badRequest('There is an error in the data')
                    )
                }

            }

            if (!teacher_id || !validateFun.isValidUUID(teacher_id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            }
            if (!name) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            }
            if (!month_payment) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            }
            if (!time) {
                return next(
                    ApiError.badRequest("data is incomplete")
                )
            }

            if (!sale) {
                return next(
                    ApiError.badRequest("data is incomplete")
                )
            } else if (sale < 0 || 100 < sale) {
                return next(
                    ApiError.badRequest('Re-enter the teacher percentage')
                )
            }
            if (!day) {
                return next(
                    ApiError.badRequest("data is incomplete")
                )
            } else {
                const result = CountWeekdays.validateArray(day);
                if (!result) {
                    return next(
                        ApiError.badRequest('Error: Array contains invalid number(s).')
                    )
                }
            }
            if (!room_id || !validateFun.isValidUUID(room_id)) {
                return next(
                    ApiError.badRequest("data is incomplete")
                )
            }
            const room = await Rooms.findOne({
                where: {
                    status: 'active',
                    id: room_id
                }
            });
            if (!room) {
                return next(
                    ApiError.badRequest('no data found')
                )
            }
            let resAllTime = false
            for (const weekDay of day) {
                const groupSchedule = await GroupSchedule.findAll({
                    where: {
                        status: 'active',
                        day_of_week: weekDay,
                        room_id
                    }
                });
                let resTime = false
                if (groupSchedule && groupSchedule.length > 0) {
                    for (const data of groupSchedule) {
                        const timeFunRes = timeFun(data.lesson_time, time);
                        if (!timeFunRes) {
                            resTime = true
                            break;
                        }


                    }
                }
                if (resTime) {
                    resAllTime = true
                    break;
                }

            }
            if (resAllTime) {
                return next(
                    ApiError.badRequest("At this time there is a lesson in the room")
                );
            }
            const day_seond = new Date().getDate();

            const pendingGroup = await DndColumns.findOne({
                where: {
                    id: column_id,
                    status: 'active'
                }
            });

            if (!pendingGroup) {
                return next(
                    ApiError.badRequest("Column not found")
                );
            };

            const pendingStudent = await StudentPending.findAll({
                where: {
                    status: 'active',
                    group_id: column_id
                }
            });

            const groupScheduleAll = []
            for (const weekDay of day) {
                const groupScheduleOne = await GroupSchedule.create({
                    room_id,
                    lesson_time: time,
                    group_id: column_id,
                    day_of_week: weekDay,
                    teacher_id,
                });
                if (groupScheduleOne) {
                    groupScheduleAll.push(groupScheduleOne.day_of_week)
                }
            }

            await LessonGroup.create({
                room_id,
                lesson_time: time,
                group_id: column_id,
                lesson_day: groupScheduleAll.join(','),
                teacher_id
            });

            await Groups.create({
                id: column_id,
                name,
                month_payment,
                sale,
                count_students: pendingGroup.items.split(',').length
            });


            await TeacherGroups.create({
                teacher_id,
                group_id: column_id
            });

            if (pendingStudent) {
                const student_id_list = pendingStudent.map((el) => el.id);
                if (student_id_list && student_id_list.length > 0) {
                    const s_length = pendingGroup.items.split(',').length;
                    const id_list = student_id_list.join(',');
                    const teacherStatistics = await TeacherStatistics.create({
                        group_id: column_id,
                        student_id: id_list,
                        student_status: 'add',
                        student_count: s_length,
                        teacher_id: teacher_id ? teacher_id : ''
                    })
                }
            }


            let attendan = false
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
                    attendan = await Attendansi.create({
                        group_id: column_id,
                        date: year + '-' + (month <= 9 ? '0' + month : month) + '-' + (day <= 9 ? '0' + day : day),
                        in_attendansi: false
                    })
                };
            };


            if (pendingStudent) {
                for (let studentsData of pendingStudent) {
                    await Students.create({
                        id: studentsData.id,
                        firstname: studentsData?.firstname ? studentsData?.firstname : '',
                        gender: studentsData?.gender ? studentsData?.gender : '',
                        birthday: studentsData?.birthday ? studentsData?.birthday : '',
                        lastname: studentsData?.lastname ? studentsData?.lastname : '',
                        fathername: studentsData?.fathername ? studentsData?.fathername : '',
                        address: studentsData?.address ? studentsData?.address : '',
                        fatherPhone: studentsData?.fatherPhone ? studentsData?.fatherPhone : '',
                        motherPhone: studentsData?.motherPhone ? studentsData?.motherPhone : '',
                        science: [],
                        class: studentsData?.class ? studentsData?.class : ''
                    });
                    await GroupStudents.create({
                        student_id: studentsData.id,
                        group_id: column_id,
                        month_payment
                    });
                    await groupStudentCreate({ student_id: studentsData.id, group_id: column_id, summa: month_payment, day: day_seond, in_stat: false });
                    if (attendan) {
                        const year = new Date().getFullYear();
                        const month = new Date().getMonth() + 1;
                        const day = new Date().getDate();
                        await AttendansiStudent.create({
                            student_id: studentsData.id,
                            attendan_id: attendan.id,
                            attendan_student_status: 'came',
                            comment: '',
                            group_id: column_id,
                            date: year + '-' + (month <= 9 ? '0' + month : month) + '-' + (day <= 9 ? '0' + day : day),
                        })
                    }

                }
            }



            const text = `${pendingGroup.name} nomli lid guruhga aylantirib ishga tushurildi`;
            await logSystemController.logsAdd({ reqdata: req, text });

            await DndColumns.destroy({
                where: {
                    id: column_id,
                    status: 'active'
                }
            });

            await StudentPending.update({
                status: 'inactive'
            }, {
                where: {
                    status: 'active',
                    group_id: column_id
                }
            });



            return res.send('A new group was created');


        } catch (error) {
            console.log(626, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async columnSendMessege(req, res, next) {
        try {
            const { id, text, time } = req.body;

            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('No data found')
                );
            } else {
                const columnsDefault = await DndColumns.findOne({
                    where: {
                        order: 1,
                        status: "active",
                    },
                });

                const columns = await DndColumns.findOne({
                    where: {
                        id,
                        status: "active",
                    },
                });

                if (id == columnsDefault.id || !columns) {
                    return next(
                        ApiError.badRequest('No data found')
                    );
                }
            }

            if (!text || text.length > 160) {
                return next(
                    ApiError.badRequest('There is an error in the text')
                )
            }

            if (!time) {
                return next(
                    ApiError.badRequest('Time not found')
                )
            }

            const students = await StudentPending.findAll({
                where: {
                    status: 'active',
                    group_id: id
                }
            });

            if (students) {
                const sendMessegeData = students.map((el) => {
                    return {
                        text,
                        phone: el.fatherPhone ? el.fatherPhone : el.motherPhone
                    }
                }).filter((el) => el && el);



                for (const data of students) {
                    await Messages.create({
                        group_id: id,
                        student_id: data.id,
                        message: text,
                        time,
                        phone: data.fatherPhone ? data.fatherPhone : data.motherPhone
                    });
                }

                await sendMessage(sendMessegeData);






            } else {
                return next(
                    ApiError.badRequest('There are no students in this column')
                )
            }

            const columns = await DndColumns.findOne({
                where: {
                    id,
                    status: "active",
                },
            });


            const text_1 = `${columns.name} nomli liddagi o'quvchilarga sms xabar yuborildi`;
            await logSystemController.logsAdd({ reqdata: req, text: text_1 });

            return res.send('The message has been sent to the students')
        } catch (error) {
            console.log(637, error.stack);
            return next(
                ApiError.badRequest(error)
            )
        }
    }

}

module.exports = new ColumsController();
