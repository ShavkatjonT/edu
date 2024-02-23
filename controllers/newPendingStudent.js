const ApiError = require("../error/ApiError");
const {
    PendingGroups,
    StudentPending,
    TeacherGroups,
    Groups,
    Teachers,
    Students,
    GroupStudents,
    DndColumns,
    GroupSchedule,
    Attendansi,
    AttendansiStudent
} = require("../models/models");
const groupStudentCreate = require('./groupStudentCreate')
const sequelize = require("../db");
const validateFun = require("./validateFun");
const CountWeekdays = require("./countWeekdays");
const { Op } = require('sequelize');
function arrfilter(arr, value, name) {
    const filterData = arr.filter((el) => el.where_user == value);
    let count = 0;
    if (filterData && filterData.length > 0) {
        filterData.forEach((el) => {
            count = count + 1;
            return;
        })
    }
    return {
        name: name,
        count_le: filterData.length,
    }

}
const logSystemController = require("./logSystemController");


class NewPendingStudentController {
    async studentAddOld(req, res, next) {
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
                group_id,
                classStudentdent
            } = req.body;
            if (!group_id || !validateFun.isValidUUID(group_id)) {
                return next(
                    ApiError.badRequest('Group not found')
                )
            }
            const pendingGroup = await PendingGroups.findOne({
                where: {
                    status: 'active',
                    id: group_id
                }
            });

            if (!pendingGroup) {
                return next(
                    ApiError.badRequest('Group not found')
                )
            }

            if (
                firstname &&
                gender &&
                birthday &&
                lastname &&
                address &&
                fatherPhone &&
                group_id
            ) {
                const student = await StudentPending.create({
                    firstname: firstname,
                    gender: gender,
                    birthday: birthday,
                    lastname: lastname,
                    fathername: fathername,
                    address: address,
                    fatherPhone: fatherPhone,
                    motherPhone: motherPhone,
                    group_id,
                    class: classStudentdent
                });


                pendingGroup.students = pendingGroup.students ? [...pendingGroup.students, student.id] : [...[], student.id];
                pendingGroup.count_students = String(Number(pendingGroup.count_students) + 1);
                await pendingGroup.save();

                return res.json({ student });
            }
        } catch (error) {
            console.log(59, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
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
                classStudentdent,
                where
            } = req.body;

            if (
                firstname &&
                gender &&
                birthday &&
                lastname &&
                address &&
                fatherPhone &&
                where
            ) {
                const dnd_column = await DndColumns.findOne({
                    where: {
                        status: 'active',
                        order: 1
                    }
                });

                const student = await StudentPending.create({
                    firstname: firstname,
                    gender: gender,
                    birthday: birthday,
                    lastname: lastname,
                    fathername: fathername,
                    address: address,
                    fatherPhone: fatherPhone,
                    motherPhone: motherPhone,
                    class: classStudentdent,
                    where_user: where,
                    group_id: dnd_column.id
                });


                const items = dnd_column?.items ? dnd_column?.items.split(',') : [];
                const resultItems = [...items, student.id]
                dnd_column.items = resultItems.join(',')
                await dnd_column.save();
                const text = `${firstname + " " + lastname}ni so'rovlarga qo'shidi`;
                await logSystemController.logsAdd({ reqdata: req, text });
                return res.json({ student });


            }
        } catch (error) {
            console.log(59, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async studentDelete(req, res, next) {
        try {
            const { id, column_id } = req.body;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            }

            if (!column_id || !validateFun.isValidUUID(column_id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            }

            const student = await StudentPending.findOne({
                where: {
                    id,
                    status: 'active'
                }
            });

            if (!student) {
                return next(
                    ApiError.badRequest('Student not found')
                )
            }

            const column = await DndColumns.findOne({
                where: {
                    id: column_id,
                    status: 'active'
                }
            });

            if (!column) {
                return next(
                    ApiError.badRequest('Student not found')
                )
            }

            let columnItmes = column?.items.split(',')
            if (!columnItmes.includes(id)) {
                return next(
                    ApiError.badRequest('There is an error in the data')
                )
            };

            columnItmes.splice(columnItmes.indexOf(id), 1);
            column.items = columnItmes.join(',');

            student.status = 'inactive';
            await student.save();
            await column.save();
            const text = `${student.firstname + " " + student.lastname}ni ${column.name} liddan o'chirildi.`;
            await logSystemController.logsAdd({ reqdata: req, text });
            return res.send('The reader has been deleted')
        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }
    async studentPut(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            };
            const {
                firstname,
                gender,
                birthday,
                lastname,
                fathername,
                address,
                fatherPhone,
                motherPhone,
                classStudentdent,
                where
            } = req.body;

            const findPersonById = await StudentPending.findOne({ where: { id, status: 'active' } });

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
            if (classStudentdent) findPersonById.class = classStudentdent;
            if (where) findPersonById.where_user = where;

            const studentUpdate = await findPersonById.save();
            if (!studentUpdate) {
                return next(
                    ApiError.badRequest(
                        `Ush bu ${id} id tegishli malumotlarni o'zgartirib bo'lmadi`
                    )
                );
            }
            const text = `Lidlardagi ${findPersonById.firstname + " " + findPersonById.lastname}ni malumotlari o'zgartirildi.`;
            await logSystemController.logsAdd({ reqdata: req, text });

            res.json({ studentUpdate });
        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }
    async studentGetOne(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            };
            const student = await StudentPending.findOne({
                where: { id, status: "active" },
            });

            let studentList = {
                firstname: student.firstname,
                lastname: student.lastname,
                fathername: student.fathername,
                gender: student.gender,
                birthday: student.birthday,
                address: student.address,
                fatherPhone: student.fatherPhone,
                motherPhone: student.motherPhone,
                class: student.class
            };

            res.json(studentList);
        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }
    async studentGroupGetList(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            };
            const pendingGroup = await PendingGroups.findOne({
                where: {
                    status: 'active',
                    id
                }
            });

            const teacherGroup = await TeacherGroups.findAll({
                where: {
                    status: "active",
                },
            });
            const group = await Groups.findAll({
                where: {
                    status: "active",
                },
            });
            const teachers = await Teachers.findAll({
                where: { status: "active", job_type: 'teacher' },
            });
            const groupName = teacherGroup && group && teacherGroup.map((el) => {
                const groupOne = group.find((e) => e.id == el.group_id);
                return groupOne && {
                    teacher_id: el.teacher_id,
                    name: groupOne.name,
                    id: groupOne.id,
                    month_payment: groupOne.month_payment
                }
            }).filter((e) => e && e);



            const groupData = groupName && teacherGroup && group && teachers && teachers.map((el) => {
                const groupOne = groupName.filter((e) => e.teacher_id == el.id);
                return {
                    id: el.id,
                    name: el.firstname + ' ' + el.lastname,
                    group: groupOne ? groupOne : []
                }
            });

            const pending_student = await StudentPending.findAll({
                where: {
                    status: 'active'
                }
            });

            const students = pending_student && pendingGroup && pendingGroup.students && pendingGroup.students.length > 0 && pendingGroup.students.map((el) => {
                const studentOne = pending_student.find((e) => e.id == el)
                return studentOne
            }).filter((el) => el && el);

            const studentSort = students && students.sort((a, b) => a.firstname.localeCompare(b.firstname));

            const studentList =
                studentSort &&
                pendingGroup &&
                studentSort.map((el) => {
                    const data = {
                        id: el.id,
                        firstname: el.firstname,
                        lastname: el.lastname,
                        Fphone: el.fatherPhone,
                        address: el.address,
                        Mphone: el.motherPhone,
                    };
                    return data;
                });

            return res.json({ studentList, pendingGroup, groupData });
        } catch (error) {
            console.log(245, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async studentCreateStudentTable(req, res, next) {
        try {
            const { column_id, group_id, student_id, summa, status } = req.body;

            if (!column_id || !validateFun.isValidUUID(column_id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            };

            if (!summa) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            } else {
                let inNumber = typeof summa;

                if (inNumber !== "number") {
                    return next(ApiError.badRequest("Summani raqamda kiriting"));
                }
            }

            let statusType = typeof status;
            if (statusType != "boolean") {
                return ApiError.badRequest("The status value was entered incorrectly")

            }

            if (!group_id || !validateFun.isValidUUID(group_id)) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            };

            if (!student_id) {
                return next(
                    ApiError.badRequest('The data is incomplete')
                )
            };


            const groups = await Groups.findOne({
                where: {
                    id: group_id,
                    status: 'active'
                }
            });
            if (!groups) {
                return next(
                    ApiError.badRequest("Groups not found")
                );
            };
            const column = await DndColumns.findOne({
                where: {
                    id: column_id,
                    status: 'active'
                }
            });
            if (!column) {
                return next(
                    ApiError.badRequest("Column not found")
                );
            };
            const pendingStudent = await StudentPending.findOne({
                where: {
                    id: student_id,
                    status: 'active'
                }
            });
            if (!pendingStudent) {
                return next(
                    ApiError.badRequest("pendingStudent not found")
                );
            };

            await GroupStudents.create({
                student_id,
                group_id,
                month_payment: summa,
                status: status ? 'test' : 'active'
            });
            await Students.create({
                id: student_id,
                firstname: pendingStudent?.firstname ? pendingStudent?.firstname : '',
                gender: pendingStudent?.gender ? pendingStudent?.gender : '',
                birthday: pendingStudent?.birthday ? pendingStudent?.birthday : '',
                lastname: pendingStudent?.lastname ? pendingStudent?.lastname : '',
                fathername: pendingStudent?.fathername ? pendingStudent?.fathername : '',
                address: pendingStudent?.address ? pendingStudent?.address : '',
                fatherPhone: pendingStudent?.fatherPhone ? pendingStudent?.fatherPhone : '',
                motherPhone: pendingStudent?.motherPhone ? pendingStudent?.motherPhone : '',
                science: [],
                class: pendingStudent?.class ? pendingStudent?.class : ''
            })
            const day = new Date().getDate();
            status ? { test_student_add: true } : await groupStudentCreate({ student_id, group_id, day, summa });
            groups.count_students = String(Number(groups.count_students) + 1);

            let columnItmes = column?.items.split(',')
            if (!columnItmes.includes(student_id)) {
                return next(
                    ApiError.badRequest('There is an error in the data')
                )
            };

            columnItmes.splice(columnItmes.indexOf(student_id), 1);
            column.items = columnItmes.join(',');
            await column.save();
            await groups.save();
            await StudentPending.update({
                status: 'inactive'
            }, {
                where: {
                    id: student_id,
                    status: 'active'
                }
            });

            const week_day = new Date().getDay();
            const lesson = await GroupSchedule.findOne({
                where: {
                    status: 'active',
                    group_id,
                    day_of_week: week_day
                }
            });

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

            const text = `${pendingStudent.firstname + " " + pendingStudent.lastname}ni ${column.name} liddan ${groups.name} guruhiga qo'shidi`;
            await logSystemController.logsAdd({ reqdata: req, text });

            return res.send('A student joined the group')
        } catch (error) {
            console.log(331, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async studentChertApi(req, res, next) {
        try {
            const { startDate, endDate } = req.body;
            if ((!startDate || !endDate) || (!validateFun.isToday_2(startDate) || !validateFun.isToday_2(endDate)) || !validateFun.toCompare(startDate, endDate)) {
                return next(
                    ApiError.badRequest('An invalid value was entered in date')
                );
            };

            const sortData = [
                { name: "O'zi tashrif buyurdi", value: 'default' },
                { name: 'Instagram', value: 'instagram' },
                { name: 'Telegram', value: 'telegram' },
                { name: 'Web sayt', value: 'website' },
            ];
            const query = `
            SELECT * FROM public."studentPendings"
            WHERE created_at >= '${startDate} 00:01:01' -- replace with your actual startDate
            AND created_at <= '${endDate} 23:59:50' -- replace with your actual endDate
            `;
            const data = await sequelize.query(query);
            const res_data = [];
            if (data && data.length > 0 && data[0].length > 0) {
                sortData.forEach((el) => {
                    const filterData = arrfilter(data[0], el.value, el.name);
                    if (filterData) {
                        res_data.push(filterData);
                    };
                    return;
                });
            };
            return res.json(res_data);

        } catch (error) {
            console.log(540, error.stack);
            return next(ApiError.badRequest(error));
        }
    }


}

module.exports = new NewPendingStudentController();
