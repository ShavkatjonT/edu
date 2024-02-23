const sequelize = require('../db');
const validateFun = require("./validateFun");
const ApiError = require("../error/ApiError");
const {
    GroupStudents,
    Groups,
    TeacherGroups,
    Teachers,
    Messages,
    Attendansi,
    AttendansiStudent,
    TeacherStatistics
} = require("../models/models");
const { Op } = require('sequelize');
const { Sequelize } = require("../db");
const monhts = [
    { id: 1, month: 'Yanvar' },
    { id: 2, month: 'Fevral' },
    { id: 3, month: 'Mart' },
    { id: 4, month: 'Aprel' },
    { id: 5, month: 'May' },
    { id: 6, month: 'Iyun' },
    { id: 7, month: 'Iyul' },
    { id: 8, month: 'Avgust' },
    { id: 9, month: 'Sentyabr' },
    { id: 10, month: 'Oktyabr' },
    { id: 11, month: 'Noyabr' },
    { id: 12, month: 'Dekabr' },
]
const monthFun = (date) => {
    const monhtOne = new Date(date).getMonth() + 1
    const monhtOneName = monhts.find((el) => el.id == monhtOne);
    return monhtOneName.month
};

class TeacherStatisticsCon {
    async teachersList(req, res, next) {
        try {
            const { id } = req.body;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('Id not found')
                );
            };

            const teacher = await Teachers.findOne({
                where: {
                    id,
                    status: 'active',
                    job_type: 'teacher'
                }
            });
            if (!teacher) {
                return next(ApiError.badRequest('No data found'));
            };

            const groups = await Groups.findAll({
                where: {
                    status: "active"
                }
            });

            const teacherGroups = await TeacherGroups.findAll({
                where: {
                    status: 'active',
                    teacher_id: id
                }
            });


            const statistics = await TeacherStatistics.findAll({
                where: {
                    teacher_id: id,
                    status: 'active',
                    created_at: {
                        [Sequelize.Op.gte]: Sequelize.literal("NOW() - INTERVAL '12 months'"),
                    },
                },
                order: [
                    ['group_id'],
                    ['student_id'],
                    [Sequelize.literal('DATE_TRUNC(\'month\', "created_at")'), 'DESC'],
                    ['created_at', 'DESC'],
                ],
            });

            const result = groups.map((group) => {
                const groupStatistics = statistics.filter((stat) => stat.group_id === group.id);
                const latestStatistics = [];
                const teacher_groups_one = teacherGroups.find((el) => el.group_id == group.id);
                const seenMonths = new Set();
                for (const stat of groupStatistics) {
                    const monthKey = stat.createdAt.toISOString().slice(0, 7);
                    if (!seenMonths.has(monthKey)) {
                        seenMonths.add(monthKey);
                        latestStatistics.push({
                            student_count: stat.student_count,
                            month: monthFun(stat.createdAt),
                        });
                    }
                }
                if (teacher_groups_one) {
                    return {
                        id: group.id,
                        name: group.name,
                        interest: group.sale,
                        statistics: latestStatistics,
                    };
                }
            }).filter((el) => el && el);
            return res.json(result)

        } catch (error) {
            console.log(10, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async groupList(req, res, next) {
        try {

        } catch (error) {
            console.log(18, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async teachersListFilter(req, res, next) {
        try {

        } catch (error) {
            console.log(26, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async groupListFilter(req, res, next) {
        try {

        } catch (error) {
            console.log(35, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
}

module.exports = new TeacherStatisticsCon();
