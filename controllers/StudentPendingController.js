const ApiError = require("../error/ApiError");
const { Students, GroupStudents, TeacherGroups, Teachers, Groups, Attendansi, AttendansiStudent, GroupSchedule } = require("../models/models");
const CountWeekdays = require("./countWeekdays");
const { Op } = require("sequelize");
const groupStudentCreate = require('./groupStudentCreate')
const validateFun = require("./validateFun");
const logSystemController = require("./logSystemController");

let date = new Date();
class StudentPendingController {
  async studentPendingAdd(req, res, next) {
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
      } = req.body;
      if (!firstname) {
        return next(ApiError.badRequest("Data is incomplete"));
      }
      if (!fathername) {
        return next(ApiError.badRequest("Data is incomplete"));
      }
      if (!address) {
        return next(ApiError.badRequest("Data is incomplete"));
      }
      if (!gender) {
        return next(ApiError.badRequest("Data is incomplete"));
      }
      if (!birthday) {
        return next(ApiError.badRequest("Data is incomplete"));
      }
      if (!lastname) {
        return next(ApiError.badRequest("Data is incomplete"));
      }
      if (!fatherPhone) {
        return next(ApiError.badRequest("Data is incomplete"));
      }
      if (!motherPhone) {
        return next(ApiError.badRequest("Data is incomplete"));
      }

      // const columnsDefault = await Columns.findOne({
      //   where: {
      //     order: 1,
      //     status: "active",
      //   },
      // });

      const student = await Students.create({
        firstname: firstname,
        gender: gender,
        birthday: birthday,
        lastname: lastname,
        fathername: fathername,
        address: address,
        fatherPhone: fatherPhone,
        motherPhone: motherPhone,
        status: "pending",
      });

      // columnsDefault.items = [...columnsDefault.items, student.id]
      // await columnsDefault.save();

      return res.json({ student });
    } catch (error) {
      return next(ApiError.badRequest(error));
    }
  }
  async studentPendingDelete(req, res, next) {
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
      findPersonById.status = 'inactive';
      await findPersonById.save();
      const text = `${findPersonById.firstname + " " + findPersonById.lastname}ni guruhlanmaganlardan malumotlari o'chirib yuborildi`;
      await logSystemController.logsAdd({ reqdata: req, text });

      res.json({ findPersonById });
    } catch (error) {
      return next(ApiError.badRequest(error));
    }
  }
  async studentPendingPut(req, res, next) {
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
        classStudentdent
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
      if (classStudentdent) findPersonById.class = motherPhone;

      const studentUpdate = await findPersonById.save();
      if (!studentUpdate) {
        return next(
          ApiError.badRequest(
            `Ush bu ${id} id tegishli malumotlarni o'zgartirib bo'lmadi`
          )
        );
      }
      const text = `${findPersonById.firstname + " " + findPersonById.lastname}ni malumotlari o'zgartirildi`;
      await logSystemController.logsAdd({ reqdata: req, text });
      res.json({ studentUpdate });
    } catch (error) {
      return next(ApiError.badRequest(error));
    }
  }
  async studentPendingGet(req, res, next) {
    try {
      const student = await Students.findAll({
        where: { status: "pending" },
      });
      res.json(student);
    } catch (error) {
      return next(ApiError.badRequest(error));
    }
  }
  async studentPendingGetOne(req, res, next) {
    try {
      const { id } = req.params;
      if (!validateFun.isValidUUID(id)) {
        return next(ApiError.badRequest("The data was entered incorrectly"));
      }
      const student = await Students.findOne({
        where: { id, status: "pending" },
      });
      res.json(student);
    } catch (error) {
      return next(ApiError.badRequest(error));
    }
  }
  async studentPendingGetList(req, res, next) {
    try {
      const { id } = req.params;
      if (!validateFun.isValidUUID(id)) {
        return next(ApiError.badRequest("The data was entered incorrectly"));
      }
      const student = await Students.findAll();
      const groupStudents = await GroupStudents.findAll({
        where: {
          [
            Op.or]: [
              { status: "active" },
              { status: "frozen" }, // Replace 'another_status' with the second status you want to query
              { status: "test" }, // Replace 'another_status' with the second status you want to query
            ], group_id: id
        },
      });
      let groupStudentList;
      const studentListOne = student.filter((e) => e.status !== "inactive");

      const studentList = studentListOne.map((el) => {
        groupStudentList = groupStudents.find((e) => e.student_id == el.id);
        if (!groupStudentList) {
          return {
            id: el.id,
            name: el.firstname + " " + el.lastname + " " + el.fathername,
          };
        }
      });

      const studentPendingList = studentList.filter((e) => e && e);

      const studentFuc = async () => {
        const data = await Promise.all(
          studentPendingList.map(async (e) => await e)
        );
        return res.json(data);
      };
      const studentResult = studentFuc();
      return studentResult;

      res.json(student);
    } catch (error) {
      return next(ApiError.badRequest(error));
    }
  }
  async studentPendingAllGetList(req, res, next) {
    try {
      const studentListOne = await Students.findAll({
        where: { status: "pending" },
      });
      const studentList = studentListOne.map((e) => {
        return {
          id: e.id,
          name: e.firstname + " " + e.lastname,
          phone: e.fatherPhone ? e.fatherPhone : e.motherPhone,
          age: String(date.getFullYear() - Number(e.birthday.substring(0, 4))),
          address: e.address,
          status: e.status,
        };
      }).sort((a, b) => a.name.localeCompare(b.name));
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

      return res.json({ groupData, studentList });
    } catch (error) {
      return next(ApiError.badRequest(error));
    }
  }
  async studentPendingGroupAdd(req, res, next) {
    try {
      const { student_id, summa, group_id, status } = req.body;

      if (!student_id || !validateFun.isValidUUID(student_id)) {
        return next(
          ApiError.badRequest('The data is incomplete')
        )
      } else {
        const StudentOne = await Students.findOne({
          where: { id: student_id, status: "pending" },
        });
        if (!StudentOne) {
          return next(ApiError.badRequest("Bunday student topilmadi"));
        }
      };
      let statusType = typeof status;
      if (statusType != "boolean") {
        return ApiError.badRequest("The status value was entered incorrectly")

      }
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
      if (!group_id || !validateFun.isValidUUID(group_id)) {
        return next(
          ApiError.badRequest('The data is incomplete')
        )
      } else {
        const groupOne = await Groups.findOne({
          where: { id: group_id, status: "active" },
        });
        if (!groupOne) {
          return next(ApiError.badRequest("Bunday group topilmadi"));
        }
      };
      const groups = await Groups.findOne({
        where: {
          status: 'active',
          id: group_id
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

      groups.count_students = String(Number(groups.count_students) + 1);
      await GroupStudents.create({
        student_id,
        group_id,
        month_payment: summa,
        status: status ? 'test' : 'active'
      });

      await groups.save()
      const student = await Students.findOne({
        where: { id: student_id, status: "pending" },
      });
      student.status = 'active'
      await student.save();

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

      const text = `${student.firstname + " " + student.lastname}ni ${groups.name} guruhiga qo'shidi`;
      await logSystemController.logsAdd({ reqdata: req, text });

      return res.json({ student, groupStudentCreateRes })
    } catch (error) {
      console.log(383, error.stack);
      return next(ApiError.badRequest(error));
    }
  }

}

module.exports = new StudentPendingController();
