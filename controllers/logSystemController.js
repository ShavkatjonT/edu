const sequelize = require('../db');
const ApiError = require("../error/ApiError");
const {
    Teachers,
    TeacherGroups,
    Logs
} = require("../models/models");
const jwt = require('jsonwebtoken');
const validateFun = require("./validateFun");


class LogSystemController {
    async logsGet(req, res, next) {
        try {
            const query = `
            SELECT
                l.id AS id,
                l.text AS text,
                l.order AS order,
                l.created_at AS date,
                t.lastname AS lastname,
                t.firstname AS firstname,
                t.id AS teacher_id,
                u.email AS email,
                u.status AS user_status,
                u.role AS role
            FROM
                logs l
            JOIN
                users u ON l.user_id::VARCHAR(255) = u.id::VARCHAR(255)
            JOIN
                teachers t ON u.teacher_id::VARCHAR(255) = t.id::VARCHAR(255)
            WHERE
                 l.status = 'active'
                AND l.created_at >= CURRENT_DATE - INTERVAL '1 month';
            `;

            const data = await sequelize.query(query);

            const resultData = data[0].map((el) => el).sort((a, b) => b?.order - a?.order)
            return res.json(resultData)
        } catch (error) {
            console.log(17, error.stack);
            return next(
                ApiError.badRequest(error)
            )
        }
    }

    async logsAdd({ reqdata, text, }) {
        try {
            const log = await Logs.findOne({
                order: [['createdAt', 'DESC']],
            });

            const role = jwt.verify(
                reqdata.headers.authorization.split(' ')[1],
                process.env.SECRET_KEY
            );

            await Logs.create({
                user_id: role?.id ? role.id : '',
                text,
                order: log?.order ? log.order + 1 : 1,
            });
            return "Logs add"
        } catch (error) {
            console.log(17, error.stack);
            return error
        }
    }

    async logsFilter(req, res, next) {

        const { id, start_date, end_date } = req.body;
        if (id && !validateFun.isValidUUID(id)) {
            return next(
                ApiError.badRequest("No data found")
            )
        };

        if (start_date && !validateFun.isValidDate_3(start_date)) {
            return next(
                ApiError.badRequest("The date was entered incorrectly")
            )
        }

        if (end_date && !validateFun.isValidDate_3(end_date)) {
            return next(
                ApiError.badRequest("The date was entered incorrectly")
            )
        };

        const month = new Date().getMonth() + 1;
        const defultdate = new Date().getFullYear() + '-' + month + '-' + '01';
        console.log(96, new Date().getDate());
        const day = new Date().getDate() <= 9 ? ('0' + String( new Date().getDate())) : new Date().getDate();
        const defultenddate = new Date().getFullYear() + '-' + month + '-' + day;
        
        const startDate = start_date ? start_date : defultdate;
        const endDate = end_date ? end_date : defultenddate;

        console.log(103, endDate);
        console.log(104, startDate);

        const query_1 = `
            SELECT
                l.id AS id,
                l.text AS text,
                l.order AS order,
                l.created_at AS date,
                t.lastname AS lastname,
                t.firstname AS firstname,
                t.id AS teacher_id,
                u.email AS email,
                u.status AS user_status,
                u.role AS role
            FROM
                logs l
            JOIN
                users u ON l.user_id::VARCHAR(255) = u.id::VARCHAR(255)
            JOIN
                teachers t ON u.teacher_id::VARCHAR(255) = t.id::VARCHAR(255)
            WHERE
                l.created_at >= '${startDate} 00:01:05'
                AND l.created_at <= '${endDate} 23:59:55' ;
            `;

        const query_2 = `
            SELECT
                l.id AS id,
                l.text AS text,
                l.order AS order,
                l.created_at AS date,
                t.lastname AS lastname,
                t.firstname AS firstname,
                t.id AS teacher_id,
                u.email AS email,
                u.status AS user_status,
                u.role AS role
            FROM
                logs l
            JOIN
                users u ON l.user_id::VARCHAR(255) = u.id::VARCHAR(255)
            JOIN
                teachers t ON u.teacher_id::VARCHAR(255) = t.id::VARCHAR(255)
            WHERE
                l.user_id::VARCHAR(255)='${id}'
                AND l.created_at >= '${startDate} 00:01:05'
                AND l.created_at <= '${endDate} 23:59:55';
            `;
        const data = !id ? await sequelize.query(query_1) : await sequelize.query(query_2);
        const resultData = data[0].map((el) => el).sort((a, b) => b?.order - a?.order)
        return res.json(resultData)
    }

    async logsDeleteCron() {
        try {
            const query = `UPDATE logs
            SET status = 'inactive'
            WHERE status = 'active' AND created_at < CURRENT_DATE - INTERVAL '3 months';
            `;
            await sequelize.query(query);
            return 'logs delete';
        } catch (error) {
            console.log(158, error.stack);
            return error;
        }
    }


}

module.exports = new LogSystemController();
