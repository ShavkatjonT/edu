const sequelize = require("../db");
const ApiError = require("../error/ApiError");
const {
    Debtors,
    Groups,
    Students,
    GroupStudents,
    TeacherGroups,
    Teachers,
    Payments,
} = require("../models/models");
const paymentCreate = require("./paymentCreate");
const { Op } = require('sequelize');
const validateFun = require("./validateFun");
const jwt = require("jsonwebtoken");
const logSystemController = require("./logSystemController");

class DebtorsController {
    async debtorAdd(req, res, next) {
        try {
            const { student_id, all_summa, group_id, month, amount } = req.body;

            if (!student_id) {
                return next(ApiError.badRequest("student idsi yo'q "));
            } else {
                const studentOne = await Students.findOne({
                    where: { id: student_id, status: "active" },
                });
                if (!studentOne) {
                    return next(ApiError.badRequest("Bunday o'quvchi topilmadi"));
                }
            }

            if (!group_id) {
                return next(ApiError.badRequest("group idsi yo'q "));
            } else {
                const groupOne = await Groups.findOne({
                    where: { id: group_id, status: "active" },
                });
                if (!groupOne) {
                    return next(ApiError.badRequest("Bunday group topilmadi"));
                }
            }

            if (!all_summa) {
                return next(ApiError.badRequest("oylik to'lov sumasi yo'q "));
            } else {
                let inNumber = typeof all_summa;
                if (inNumber !== "number") {
                    return next(ApiError.badRequest("Summani raqamda kiriting"));
                }
            }

            if (!amount) {
                return next(ApiError.badRequest("oylik to'lov sumasi yo'q "));
            } else {
                let inNumber = typeof amount;
                if (inNumber !== "number") {
                    return next(ApiError.badRequest("Summani raqamda kiriting"));
                }
            }

            const debtor = await Debtors.create({
                student_id,
                group_id,
                month,
                amount,
                all_summa,
            });
            res.json({ debtor });
        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }

    async debtorDelete(req, res, next) {
        try {
            const role = jwt.verify(
                req.headers.authorization.split(' ')[1],
                process.env.SECRET_KEY
            );
            if (role && (role.role == 'super' || role.role == 'casher')) {
                const { student_id, group_id, given_summa, sale, payment_type } = req.body;

                const update = false;
                if (!student_id || !validateFun.isValidUUID(student_id)) {
                    return next(ApiError.badRequest("student idsi yo'q "));
                } else {
                    const studentOne = await Students.findOne({
                        where: { id: student_id, },
                    });
                    if (!studentOne) {
                        return next(ApiError.badRequest("Bunday o'quvchi topilmadi"));
                    }
                };

                if (!payment_type) {
                    return next(ApiError.badRequest("to'lov turi  yo'q "));
                }

                if (!group_id || !validateFun.isValidUUID(group_id)) {
                    return next(ApiError.badRequest("group idsi yo'q "));
                } else {
                    const groupOne = await Groups.findOne({
                        where: { id: group_id, },
                    });
                    if (!groupOne) {
                        return next(ApiError.badRequest("Bunday group topilmadi"));
                    }
                };

                if ((!given_summa && !sale) || (given_summa == 0 && sale == 0)) {
                    return next(ApiError.badRequest("qarz summasi yuborilmadi"));
                } else {
                    let inNumber = typeof given_summa;
                    if (inNumber !== "number") {
                        return next(ApiError.badRequest("Summani raqamda kiriting"));
                    }
                }
                const paymentFun = await paymentCreate({
                    student_id,
                    group_id,
                    given_summa,
                    sale,
                    update,
                    payment_type
                });

                return res.json(paymentFun);
            } else {
                return next(
                    ApiError.badRequest('Changing user data is not allowed')
                )
            }

        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }

    async debtorDeleteOne(req, res, next) {
        try {
            const { id } = req.body;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('Idni qiymati xato kiritildi.')
                )
            };

            const debtorDelete = await Debtors.findOne({ where: { id, status: 'active' } });
            if (!debtorDelete) {
                return next(
                    ApiError('The reference could not be deleted')
                )
            };

            debtorDelete.status = 'inactive';
            await debtorDelete.save();
            const student = await Students.findOne({
                where: {
                    id: debtorDelete.student_id
                }
            });

            const group = await Groups.findOne({
                where: {
                    id: debtorDelete.group_id
                }
            });

            const text = `${student.lastname} ${student.firstname}ni ${group.name} guruhdagi ${debtorDelete.month} oydagi qarzi o'chirib yuborildi`;
            await logSystemController.logsAdd({ reqdata: req, text });

            return res.json({ "debtor": 'delete', debtorDelete });
        } catch (error) {
            console.log(175, error.stack);
            return next(ApiError.badRequest(error));
        }
    }

    async debtorPut(req, res, next) {
        try {
            const { id } = req.params;
            const { student_id, all_summa, group_id, month, amount } = req.body;
            const debtorsById = await Debtors.findOne({ where: { id } });

            if (!debtorsById) {
                return next(ApiError.badRequest(`Ushbu idli o'quvchi topilmadi`));
            }
            if (student_id) debtorsById.student_id = student_id;
            if (amount) debtorsById.amount = Math.trunc(amount);
            if (all_summa) debtorsById.all_summa = Math.trunc(all_summa);
            if (group_id) debtorsById.group_id = group_id;
            if (month) debtorsById.month = month;

            const debtorsUpdate = await debtorsById.save();
            if (!debtorsUpdate) {
                return next(
                    ApiError.badRequest(
                        `Ush bu ${id} id tegishli malumotlarni o'zgartirib bo'lmadi`
                    )
                );
            }
            res.json({ debtorsUpdate });
        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }

    async debtorGet(req, res, next) {
        try {
            const { id } = req.params;

            const debtors = await Debtors.findAll({
                where: { status: "active", group_id: id },
            });
            const student = await Students.findAll({
                where: { status: "active" },
            });
            const group = await Groups.findOne({
                where: { status: "active", id: id },
            });
            const groupStudents = await GroupStudents.findAll({
                where: {
                    [Op.or]: [
                        { status: 'active' },
                        { status: 'frozen' }, // Replace 'another_status' with the second status you want to query
                        { status: 'test' }, // Replace 'another_status' with the second status you want to query
                    ], group_id: id
                },
            });

            const studentList =
                groupStudents &&
                student &&
                student.filter((el) => {
                    return groupStudents.find((e) => e.student_id == el.id);
                }).sort((a, b) => a.firstname.localeCompare(b.firstname));

            let amount = 0;
            const debtorsList =
                group &&
                studentList &&
                studentList.map((el) => {
                    const debtorsOne =
                        debtors &&
                        debtors.filter((e) => {
                            if (e.student_id == el.id) {
                                amount = amount + e.amount;
                            }

                            return e.student_id == el.id;
                        });

                    const groupStudentOne = groupStudents.find(
                        (e) => e.student_id == el.id
                    );
                    const data = {
                        id: el.id,
                        name: el.firstname + " " + el.lastname,
                        phone: el.fatherPhone ? el.fatherPhone : el.motherPhone,
                        months: debtorsOne && debtorsOne,
                        amount: amount ? amount : 0,
                        groupId: group.id,
                        gruoName: group.name,
                        wallet: groupStudentOne.wallet,
                    };
                    amount = 0;
                    return data;
                });
            const debtorFilter = debtorsList.filter((e) => (e.wallet < 0 || e.amount > 0) && e);
            res.json(debtorFilter);
        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }

    async debtorAllGet(req, res, next) {
        try {
            const debtors = await Debtors.findAll({
                where: { status: "active" },
            });
            const student = await Students.findAll();
            const group = await Groups.findAll();
            const groupStudents = await GroupStudents.findAll();
            const teacher_groups = await TeacherGroups.findAll({
                where: {
                    status: 'active',
                }
            });
            const teachers = await Teachers.findAll({
                where: {
                    job_type: 'teacher',
                    status: 'active'
                }
            });
            const studentSort = student && student.sort((a, b) => a.firstname.localeCompare(b.firstname));
            let amount = 0;
            const debtorsList =
                group &&
                studentSort &&
                groupStudents &&
                group.map((el) => {
                    const groupOne = groupStudents.filter((e) => e.group_id == el.id);
                    const debtorOne = debtors.filter((e) => e.group_id == el.id);
                    const studentOne = studentSort.filter((e) => {
                        return groupOne.find((ele) => ele.student_id == e.id)
                    }).sort((a, b) => a.firstname.localeCompare(b.firstname));
                    const teacherGroup = teacher_groups.find((e) => e.group_id == el.id);
                    const teacherOne = teacherGroup ? teachers.find((e) => e.id == teacherGroup.teacher_id) : false
                    const teacherData = {
                        name: teacherOne ? teacherOne.lastname + ' ' + teacherOne.firstname : '',
                        id: teacherOne ? teacherOne.id : '',
                    }
                    let dataList = {
                        group: {
                            name: el.name,
                            id: el.id
                        },
                        debtors: [],
                        teacherData,
                    }
                    debtorOne && debtorOne.length > 0 && studentOne.forEach((e) => {
                        const debtorList = debtorOne.filter((ele) => ele.student_id == e.id);
                        debtorList.forEach((ele) => {
                            return amount = amount + ele.amount
                        })
                        const data = debtorList && debtorList.length > 0 && {
                            name: e.lastname + ' ' + e.firstname,
                            id: e.id,
                            debtors: debtorList && debtorList,
                            amount
                        }
                        amount = 0
                        if (debtorList && debtorList.length > 0) {
                            dataList.debtors.push(data);
                        }
                        return;
                    });

                    return dataList
                });

            const dataFiletr = debtorsList.filter((el) => el.debtors.length > 0 && el.debtors && el);

            res.json(dataFiletr);
        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }

    async debtorAllGetNew(req, res, next) {
        try {
            const query = `SELECT json_agg(json_build_object(
                'student_id', s.id,
                'lastName', s.lastName,
                'firstName', s.firstName,
                'group', json_build_object(
                    'group_id', g.id,
                    'name', g.name
                ),
                
                'debtors', (
                        SELECT json_agg(json_build_object(
                            'debtor_id', d.id,
                            'amount', d.amount,
                            'month', d.month,
                            'note', d.note
                        ))
                        FROM debtors AS d
                        WHERE d.status = 'active'
                        AND d.group_id::VARCHAR(255) = gs.group_id::VARCHAR(255)
                        AND d.student_id::VARCHAR(255) = gs.student_id::VARCHAR(255)
                ),
                'all_summa', (
                        SELECT SUM(d.amount)
                        FROM debtors AS d
                        WHERE d.status = 'active'
                        AND d.group_id::VARCHAR(255) = gs.group_id::VARCHAR(255)
                        AND d.student_id::VARCHAR(255) = gs.student_id::VARCHAR(255)
                )
            )) AS data
            FROM group_students AS gs
            JOIN students AS s ON gs.student_id::VARCHAR(255) = s.id::VARCHAR(255)
            JOIN groups AS g ON gs.group_id::VARCHAR(255) = g.id::VARCHAR(255)
            WHERE EXISTS (
                SELECT 1
                FROM debtors AS d
                WHERE d.status = 'active'
                AND d.group_id::VARCHAR(255) = gs.group_id::VARCHAR(255)
                AND d.student_id::VARCHAR(255) = gs.student_id::VARCHAR(255)
            );
            `;
            const data = await sequelize.query(query);
            return res.json(data[0][0])
        } catch (error) {
            console.log(343, error.stack);
            return next(
                ApiError.badRequest(error)
            )
        }
    }

    async debtorNote(req, res, next) {
        try {
            const { id, text } = req.body;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('There is an error in id')
                );
            };

            if (!text) {
                return next(
                    ApiError.badRequest('No text entered')
                );
            };
            const debtor = await Debtors.findOne({
                where: {
                    status: 'active',
                    id
                }
            });
            if (!debtor) {
                return next(
                    ApiError.badRequest('No data found')
                );
            };
            debtor.note = text;
            await debtor.save();
            const student = await Students.findOne({
                where: {
                    id: debtor.student_id
                }
            });

            const group = await Groups.findOne({
                where: {
                    id: debtor.group_id
                }
            });


            const text_1 = `${student.lastname} ${student.firstname}ni ${group} guruhdagi ${debtor.month} oydagi eslatma yozdi.`;
            await logSystemController.logsAdd({ reqdata: req, text: text_1 });

            return res.send('Data saved')
        } catch (error) {
            console.log(378, error.stack);
            return next(
                ApiError.badRequest(error)
            )
        }
    }

}

module.exports = new DebtorsController();

