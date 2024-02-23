const ApiError = require("../error/ApiError");
const {
    Teachers,
    TeacherGroups,
    Groups,
    Monthly,
    User,
    EmployeeNotes
} = require("../models/models");
const sendMessage = require("./sendMessageController");
const validateFun = require("./validateFun");
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');

class EmployeeNotesController {
    async employeeNoteAdd(req, res, next) {
        try {
            const { teacher_id, color, text } = req.body;
            if (!teacher_id || !validateFun.isValidUUID(teacher_id)) {
                return next(
                    ApiError.badRequest('Id not found')
                );
            };
            if (!color) {
                return next(
                    ApiError.badRequest('Color not found')
                );
            };
            if (!text) {
                return next(
                    ApiError.badRequest('Text not found')
                );
            };
            const employee = await Teachers.findOne({
                where: {
                    status: 'active',
                    id: teacher_id
                }
            });
            if (!employee) {
                return next(
                    ApiError.badRequest('Data not found')
                );
            }

            await EmployeeNotes.create({
                teacher_id,
                color,
                text
            });
            res.send('Employee note added');
        } catch (error) {
            console.log(53, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async employeeNoteDelete(req, res, next) {
        try {
            const { id } = req.body;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(ApiError.badRequest("No data found"));
            };
            const note = await EmployeeNotes.findOne({
                where: {
                    status: 'active',
                    id
                }
            });

            if (!note) {
                return next(ApiError.badRequest("No data found"));
            }

            note.status = 'inactive';
            await note.save();

            req.send("The employee's note has been deleted")
        } catch (error) {
            console.log(61, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async employeeNotePut(req, res, next) {
        try {
            const { id, teacher_id, color, text } = req.body;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(ApiError.badRequest("No data found"));
            };
            if (!teacher_id || !validateFun.isValidUUID(teacher_id)) {
                return next(
                    ApiError.badRequest('Id not found')
                );
            };
            if (!color) {
                return next(
                    ApiError.badRequest('Color not found')
                );
            };
            if (!text) {
                return next(
                    ApiError.badRequest('Text not found')
                );
            };
            const note = await EmployeeNotes.findOne({
                where: {
                    status: 'active',
                    id
                }
            });
            if (!note) {
                return next(ApiError.badRequest("No data found"));
            }
            const employee = await Teachers.findOne({
                where: {
                    status: 'active',
                    id: teacher_id
                }
            });
            if (!employee) {
                return next(
                    ApiError.badRequest('Data not found')
                );
            }

            note.teacher_id = teacher_id;
            note.color = color;
            note.note = text;
            await note.save();
            req.send('note update');

        } catch (error) {
            console.log(69, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async employeeNoteGet(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(ApiError.badRequest("No data found"));
            };

            const notes = await EmployeeNotes.findAll({
                where: {
                    status: 'active',
                    teacher_id: id
                }
            });
            const notesFilter = notes && notes.length > 0 ? notes : []
            res.json(notesFilter)
        } catch (error) {
            console.log(77, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
};

module.exports = new EmployeeNotesController();
