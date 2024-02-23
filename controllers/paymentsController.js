const ApiError = require("../error/ApiError");
const {
    Payments,
    Students,
    Groups,
    TeacherGroups,
    Teachers,
    GroupStudents,
    Debtors
} = require("../models/models");
const paymentDelete = require("./paymentDelete");
const paymentCreate = require("./paymentCreate");
const dateFormat = require('date-and-time')
const sequelize = require("../db");
const validateFun = require("./validateFun");
const jwt = require("jsonwebtoken");
const logSystemController = require("./logSystemController");

function compareDatesDescending(a, b) {
    const dateA = new Date(a.payment.created_at);
    const dateB = new Date(b.payment.created_at);
    return dateB - dateA;
}
function separateArrayIntoGroups(inputArray, groupSize) {
    const separatedArray = [];

    for (let i = 0; i < inputArray.length; i += groupSize) {
        separatedArray.push(inputArray.slice(i, i + groupSize));
    }

    return separatedArray;
}
function validateParams(value, page) {
    // Check if 'value' and 'page' are valid numbers
    const isValueValid = !isNaN(value) && isFinite(value);
    const isPageValid = !isNaN(page) && isFinite(page);

    if (isValueValid && isPageValid) {
        return true; // Both 'value' and 'page' are valid numbers
    } else {
        return false; // At least one of them is not a valid number
    }
}
function arrfilter(arr, value, name) {
    const filterData = arr.filter((el) => el.payment_type == value);
    let count = 0;
    let count_sum = 0;
    if (filterData && filterData.length > 0) {
        filterData.forEach((el) => {
            count_sum = count_sum + el.amount;
            count = count + 1;
            return;
        })
    }
    return {
        name: name,
        amount: count_sum,
        count_le: count
    }

}
class PaymentsController {
    async paymentAdd(req, res, next) {
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
                        where: { id: student_id, status: "active" },
                    });
                    if (!studentOne) {
                        return next(ApiError.badRequest("Bunday o'quvchi topilmadi"));
                    }
                };

                if (!group_id || !validateFun.isValidUUID(group_id)) {
                    return next(ApiError.badRequest("group idsi yo'q "));
                } else {
                    const groupOne = await Groups.findOne({
                        where: { id: group_id, status: "active" },
                    });
                    if (!groupOne) {
                        return next(ApiError.badRequest("Bunday group topilmadi"));
                    }
                };

                if ((!given_summa && !sale) || (given_summa == 0 && sale == 0)) {
                    return next(ApiError.badRequest("to'lov qilingan suma yo'q "));
                } else {
                    let inNumber = typeof given_summa;
                    if (inNumber !== "number") {
                        return next(ApiError.badRequest("Summani raqamda kiriting"));
                    }
                    if (given_summa > 10000000) {
                        return next(
                            ApiError.badRequest(
                                "Berilban summa yuzmiliondan kop summani kamaytiring"
                            )
                        );
                    }
                };

                if (!payment_type) {
                    return next(ApiError.badRequest("to'lov turi  yo'q "));
                }

                let inNumber = sale && typeof sale;

                if (sale) {
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
                    payment_type,
                    req
                });

                return res.json(paymentFun);
            } else {
                return next(
                    ApiError.badRequest('Changing user data is not allowed')
                )
            }

        } catch (error) {
            return next(ApiError.badRequest(`${error} : paymet add`));
        }
    }
    async paymentDelete(req, res, next) {
        try {
            const role = jwt.verify(
                req.headers.authorization.split(' ')[1],
                process.env.SECRET_KEY
            );
            if (role && (role.role == 'super' || role.role == 'casher')) {
                const { id } = req.body;
                const paymentDeleteFun = await paymentDelete({ id, update: false, req });
                res.json({ paymentDeleteFun });
            } else {
                return next(
                    ApiError.badRequest('Changing user data is not allowed')
                )
            }

        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }
    async paymentPut(req, res, next) {
        try {
            const role = jwt.verify(
                req.headers.authorization.split(' ')[1],
                process.env.SECRET_KEY
            );
            if (role && (role.role == 'super' || role.role == 'casher')) {
                const { id, student_id, group_id, given_summa, sale, payment_type } = req.body;
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
                const update = true;
                const paymentDeleteFun = await paymentDelete({ id, update });
                const paymentCreateFun = await paymentCreate({
                    student_id,
                    group_id,
                    given_summa,
                    sale,
                    update,
                    payment_type,
                    req
                });
                res.json({ paymentDeleteFun, paymentCreateFun });
            } else {
                return next(
                    ApiError.badRequest('Changing user data is not allowed')
                )
            }

        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }
    async paymentGet(req, res, next) {
        try {
            const date = new Date();
            const payments = await Payments.findAll({
                where: { status: "active" },
            });
            const groupStudent = await GroupStudents.findAll();

            // const monthFun = (arr) => {
            //   const monthText = arr.substring(5);
            //   const years = arr.substring(0, 4);
            //   let monthPay;
            //   switch (monthText) {
            //     case "01":
            //       monthPay = "Yanvar";
            //       break;
            //     case "02":
            //       monthPay = "Fevral";
            //       break;
            //     case "03":
            //       monthPay = "Mart";
            //       break;
            //     case "04":
            //       monthPay = "Aprel";
            //       break;
            //     case "05":
            //       monthPay = "May";
            //       break;
            //     case "06":
            //       monthPay = "Iyun";
            //       break;
            //     case "07":
            //       monthPay = "Iyul";
            //       break;
            //     case "08":
            //       monthPay = "Avgust";
            //       break;
            //     case "09":
            //       monthPay = "Sentabr";
            //       break;
            //     case "10":
            //       monthPay = "Oktabr";
            //       break;
            //     case "11":
            //       monthPay = "Noyabr";
            //       break;
            //     case "12":
            //       monthPay = "Dekabr";
            //       break;

            //     default:
            //       break;
            //   }
            //   const month = years + "-" + monthPay;
            //   return month;
            // };


            const students = await Students.findAll();
            const groups = await Groups.findAll();
            const paymentList =
                payments &&
                students &&
                groupStudent &&
                payments.map((el) => {
                    const groupStudentOne = groupStudent.find(
                        (e) => e.id == el.group_student_id
                    );
                    const studentOne = groupStudentOne && students.find(
                        (e) => e.id == groupStudentOne.student_id
                    );
                    const groupOne = groupStudentOne && groups.find((e) => e.id == groupStudentOne.group_id);
                    const data = studentOne &&
                        groupOne && {
                        id: el.id,
                        group: {
                            id: groupOne.id && groupOne.id,
                            name: groupOne.name,
                        },

                        student: {
                            id: studentOne.id,
                            name: studentOne.firstname + " " + studentOne.lastname,
                            lastname: studentOne.lastname,
                            firstname: studentOne.firstname
                        },
                        sale: el.sale ? el.sale : 0,
                        // month: monthFun(el.month),
                        summa: el.amount,
                        createdAt: el.createdAt,
                        updatedAt: el.createdAt,
                        deleteActive:
                            Math.trunc((date - el.createdAt) / 3600000) <= 24
                                ? true
                                : false,
                    };
                    return data;
                });


            const filterTime = (e) => {
                const timeDate = String(e);
                const filterYear = timeDate.substring(0, 24);
                return filterYear;
            };


            const paymentFilter = paymentList.filter((e) => e && e);
            const paymentSort = paymentFilter.sort(function (a, b) {
                return b.createdAt - a.createdAt;
            });
            const excelData = paymentSort.map((el) => {
                const data = {
                    Ism: el.student.firstname,
                    Familya: el.student.lastname,
                    Summa: el.summa,
                    Chegirma: el.sale ? el.sale : 0,
                    "Yaratilgan vaqt": filterTime(el.createdAt),
                };
                return data
            });

            res.json({ paymentSort, excelData });
        } catch (error) {
            console.log(error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async paymentGetNew(req, res, next) {
        try {
            const query = `SELECT jsonb_agg(result) AS result_array
      FROM (
        SELECT
          jsonb_build_object(
            'group_student_id', gs.id,
            'student', jsonb_build_object(
              'id', s.id,
              'lastname', s.lastname,
              'firstname', s.firstname
            ),
            'groups', jsonb_build_object(
              'id', g.id,
              'name', g.name
            ),
          'payment', p,
          'payment_types',pt
          ) AS result
        FROM payments AS p
        JOIN group_students AS gs ON p.group_student_id::VARCHAR(255) = gs.id::VARCHAR(255)
        JOIN students AS s ON gs.student_id::VARCHAR(255) = s.id::VARCHAR(255)
        JOIN payment_types AS pt ON pt.payment_id::VARCHAR(255) = p.id::VARCHAR(255)
        JOIN groups AS g ON gs.group_id::VARCHAR(255) = g.id::VARCHAR(255)
        WHERE p.status = 'active'
      ) AS subquery; `;
            const { size, page, } = req.params;

            if (size && page && validateParams(size, page) && size > 0 && page > 0) {
                const pageN = Number(page);
                const sizeN = Number(size);
                const date = new Date();
                const data = await sequelize.query(query);
                const resultData = {};
                if (data && data.length > 0 && data[0].length > 0 && data[0][0]?.result_array) {
                    const updateData = data[0][0].result_array;
                    updateData.sort(compareDatesDescending);
                    const dataMap = updateData.map((el) => {
                        const createdAt = new Date(el.payment.created_at)
                        const payment_type = el?.payment_types?.payment_type ? el?.payment_types?.payment_type : ''
                        const newObj = {
                            id: el.payment.id,
                            group: el.groups,

                            student: el.student,

                            sale: el.payment.sale ? el.payment.sale : 0,
                            // month: monthFun(el.month),
                            summa: el.payment.amount,
                            createdAt: createdAt,
                            updatedAt: createdAt,
                            payment_type,
                            deleteActive:
                                Math.trunc((date - createdAt) / 3600000) <= 24
                                    ? true
                                    : false,
                        };
                        return newObj
                    });
                    const res = separateArrayIntoGroups(dataMap, sizeN);
                    resultData.data = res[pageN - 1] ? res[pageN - 1] : []
                    resultData.allPage = res.length
                    resultData.size = sizeN
                    resultData.page = pageN
                }

                res.json(resultData)
            } else {
                return next(
                    ApiError.badRequest('No data found')
                )
            }

        } catch (error) {
            console.log(235, error.stack);
            return next(
                ApiError.badRequest(error)
            )
        }
    }
    async paymentGetNew_2(req, res, next) {
        try {
            let query = `SELECT jsonb_agg(result) AS result_array
      FROM (
        SELECT
          jsonb_build_object(
            'group_student_id', gs.id,
            'student', jsonb_build_object(
              'id', s.id,
              'lastname', s.lastname,
              'firstname', s.firstname
            ),
            'groups', jsonb_build_object(
              'id', g.id,
              'name', g.name
            ),
          'payment', p,
          'payment_types',pt
          ) AS result
        FROM payments AS p
        JOIN group_students AS gs ON p.group_student_id::VARCHAR(255) = gs.id::VARCHAR(255)
        JOIN students AS s ON gs.student_id::VARCHAR(255) = s.id::VARCHAR(255)
        JOIN payment_types AS pt ON pt.payment_id::VARCHAR(255) = p.id::VARCHAR(255)
        JOIN groups AS g ON gs.group_id::VARCHAR(255) = g.id::VARCHAR(255)
        WHERE p.status = 'active'
      ) AS subquery; `;
            const { size, page, lastname, firstname, group_name, start_date, end_date, st_sum, en_sum, payment_type } = req.body;
            if (size && page && validateParams(size, page) && size > 0 && page > 0) {
                const pageN = Number(page);
                const sizeN = Number(size);
                const date = new Date();
                const data = await sequelize.query(query);
                const resultData = {};

                if (data && data.length > 0 && data[0].length > 0 && data[0][0]?.result_array) {
                    const updateData = data[0][0].result_array;
                    updateData.sort(compareDatesDescending);

                    const filterData = updateData.filter((el) => {
                        const name = el.student.lastname.toLowerCase();
                        if (lastname) {
                            const searchText = lastname.toLowerCase()
                            return name.includes(searchText)
                        } else {
                            return true;
                        }

                    }).filter((el) => {
                        const name = el.student.firstname.toLowerCase();
                        if (firstname) {
                            const searchText = firstname.toLowerCase();
                            return name.includes(searchText)
                        } else {
                            return true;
                        }
                    }).filter((el) => {
                        const name = el.groups?.name.toLowerCase();
                        if (group_name && name) {
                            const searchText = group_name.toLowerCase();
                            return name.includes(searchText)
                        } else {
                            return true;
                        }
                    }).filter((el) => {
                        const summa = el.payment.amount;
                        if (st_sum) {
                            return st_sum <= summa
                        } else {
                            return true;
                        }
                    }).filter((el) => {
                        const summa = el.payment.amount;
                        if (en_sum) {
                            return en_sum >= summa
                        } else {
                            return true;
                        }
                    }).filter((el) => {
                        const date = el.payment.created_at;
                        const monthOne = new Date(date).getMonth() + 1;
                        const day = new Date(date).getDate();
                        const currentMonth = new Date(date).getFullYear() + "-" + (monthOne <= 9 ? "0" : '') + '' + monthOne + "-" + (day <= 9 ? "0" : '') + '' + day;
                        if (start_date && validateFun.isValidDate_3(start_date)) {
                            const curDate = new Date(`${currentMonth} 00:01:01`)
                            const startDate = new Date(`${start_date} 00:01:01`)
                            return startDate <= curDate
                        } else {
                            return true;
                        }
                    }).filter((el) => {
                        const date = el.payment.created_at;
                        const monthOne = new Date(date).getMonth() + 1;
                        const day = new Date(date).getDate();
                        const currentMonth = new Date(date).getFullYear() + "-" + (monthOne <= 9 ? "0" : '') + '' + monthOne + "-" + (day <= 9 ? "0" : '') + '' + day;
                        if (end_date && validateFun.isValidDate_3(end_date)) {
                            const curDate = new Date(`${currentMonth} 00:01:01`)
                            const startDate = new Date(`${end_date} 00:01:01`)
                            return startDate >= curDate
                        } else {
                            return true;
                        };
                    }).filter((el) => {
                        const name = el.payment_types.payment_type.toLowerCase();
                        if (payment_type) {
                            const searchText = payment_type.toLowerCase();
                            return name.includes(searchText)
                        } else {
                            return true;
                        }
                    });

                    const dataMap = filterData.map((el) => {
                        const createdAt = new Date(el.payment.created_at)
                        const payment_type = el?.payment_types?.payment_type ? el?.payment_types?.payment_type : ''
                        const newObj = {
                            id: el.payment.id,
                            group: el.groups,

                            student: el.student,

                            sale: el.payment.sale ? el.payment.sale : 0,
                            // month: monthFun(el.month),
                            summa: el.payment.amount,
                            createdAt: createdAt,
                            updatedAt: createdAt,
                            payment_type,
                            deleteActive:
                                Math.trunc((date - createdAt) / 3600000) <= 24
                                    ? true
                                    : false,
                        };
                        return newObj
                    });
                    const resD = separateArrayIntoGroups(dataMap, sizeN);
                    resultData.data = resD[pageN - 1] ? resD[pageN - 1] : []
                    resultData.allPage = resD.length
                    resultData.size = sizeN
                    resultData.page = pageN


                }

                res.json(resultData)
            } else {
                return next(
                    ApiError.badRequest('No data found')
                )
            }

        } catch (error) {
            console.log(235, error.stack);
            return next(
                ApiError.badRequest(error)
            )
        }
    }
    async paymentExcelData(req, res, next) {
        try {
            const date = new Date();
            const { startDate, endDate } = req.body;
            const payments = await Payments.findAll({
                where: { status: "active" },
            });

            const teacherGroup = await TeacherGroups.findAll({
                where: {
                    status: 'active'
                }
            });

            const teacher = await Teachers.findAll({
                where: {
                    status: 'active',
                    job_type: 'teacher'
                }
            });



            const paymentFilterDate = payments && payments.filter((el) => {
                const format = dateFormat.format(el.createdAt, 'YYYY-MM-DD HH:mm:ss');
                const month = dateFormat.format(date, 'YYYY-MM-DD HH:mm:ss')
                const time = format.substring(0, 10)
                if (startDate && endDate) {
                    return startDate <= time && time <= endDate
                } else {
                    const monthOne = month.substring(5, 7);
                    return monthOne == time.substring(5, 7)
                }

            });

            const groupStudent = await GroupStudents.findAll();
            const students = await Students.findAll();

            const groups = await Groups.findAll();
            const paymentList =
                paymentFilterDate &&
                groupStudent &&
                paymentFilterDate.map((el) => {
                    const groupStudentOne = groupStudent.find(
                        (e) => e.id == el.group_student_id
                    );

                    const teacherGroupOne = teacherGroup.find((e) =>
                        e.group_id == groupStudentOne.group_id
                    );

                    const teacherOne = teacherGroupOne && teacher.find((e) =>
                        teacherGroupOne.teacher_id == e.id
                    )

                    const studentOne = students.find(
                        (e) => e.id == groupStudentOne.student_id
                    );

                    const groupOne = groups.find((e) => e.id == groupStudentOne.group_id);
                    const data = studentOne &&
                        groupOne && {
                        id: el.id,
                        group: {
                            id: groupOne.id && groupOne.id,
                            name: groupOne.name,
                        },
                        teacher: teacherOne && {
                            name: teacherOne.firstname + " " + teacherOne.lastname
                        },
                        student: {
                            id: studentOne.id,
                            name: studentOne.firstname + " " + studentOne.lastname,
                            lastname: studentOne.lastname,
                            firstname: studentOne.firstname
                        },
                        sale: el.sale ? el.sale : 0,
                        summa: el.amount,
                        createdAt: el.createdAt,
                        updatedAt: el.createdAt,
                    };
                    return data;
                });
            const filterTime = (e) => {
                const timeDate = String(e);
                const filterYear = timeDate.substring(0, 24);
                return filterYear;
            };


            const paymentFilter = paymentList.filter((e) => e && e);

            const paymentSort = paymentFilter.sort(function (a, b) {
                return b.createdAt - a.createdAt;
            });

            const excelData = paymentSort.map((el) => {
                const data = {
                    Ism: el.student.firstname,
                    Familya: el.student.lastname,
                    Guruh: el.group.name,
                    "O'qtuchi": el.teacher && el.teacher.name,
                    Summa: el.summa,
                    Chegirma: el.sale ? el.sale : 0,
                    "Yaratilgan vaqt": filterTime(el.createdAt),
                };
                return data
            });


            let a = 0
            excelData.forEach((el) => {
                a = a + el.Summa
            });

            res.json(excelData);
        } catch (error) {
            console.log(341, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async paymentChartGet(req, res, next) {
        try {

            const date = new Date();
            const payments = await Payments.findAll({
                where: { status: "active" },
            });
            const monthTextFun = (arr) => {
                const monthText = arr.substring(5);
                const years = arr.substring(0, 4);
                let monthPay;
                switch (monthText) {
                    case "01":
                        monthPay = "Yanvar";
                        break;
                    case "02":
                        monthPay = "Fevral";
                        break;
                    case "03":
                        monthPay = "Mart";
                        break;
                    case "04":
                        monthPay = "Aprel";
                        break;
                    case "05":
                        monthPay = "May";
                        break;
                    case "06":
                        monthPay = "Iyun";
                        break;
                    case "07":
                        monthPay = "Iyul";
                        break;
                    case "08":
                        monthPay = "Avgust";
                        break;
                    case "09":
                        monthPay = "Sentabr";
                        break;
                    case "10":
                        monthPay = "Oktabr";
                        break;
                    case "11":
                        monthPay = "Noyabr";
                        break;
                    case "12":
                        monthPay = "Dekabr";
                        break;

                    default:
                        break;
                }
                const month = years + "-" + monthPay;
                return month;
            };
            const monthFun = (arg) => {
                let monthName = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
                let dateOne = arg;
                dateOne.setDate(1);
                let lastMonth = [];
                for (let i = 0; i <= 11; i++) {
                    let lastMonthOne = String(dateOne.getFullYear() + '-' + monthName[dateOne.getMonth()])
                    lastMonth.push(lastMonthOne);
                    dateOne.setMonth(dateOne.getMonth() - 1);
                }
                return lastMonth
            }

            const student = await Students.findAll({
                where: {
                    status: 'active'
                }
            });
            const pendingStudent = await Students.findAll({
                where: {
                    status: 'pending'
                }
            });
            const groups = await Groups.findAll({
                where: {
                    status: 'active'
                }
            });

            const month = monthFun(date);
            let payData = []
            month.forEach((el) => {
                let dataOne = payments.filter((e) => {
                    const format = dateFormat.format(e.createdAt, 'YYYY-MM-DD HH:mm:ss');
                    const day = format.substring(0, 7);
                    return day == el
                })
                let amount = 0
                dataOne && dataOne.length > 0 && dataOne.forEach((e) => {
                    amount = amount + e.amount
                });

                const chartData = dataOne && dataOne.length > 0 && {
                    month: monthTextFun(el),
                    summa: amount
                }
                dataOne && dataOne.length > 0 && payData.push(chartData)
                return;
            });
            let studentList = []
            student && month.forEach((el) => {
                let studentOne = student.filter((e) => {
                    const format = dateFormat.format(e.createdAt, 'YYYY-MM-DD HH:mm:ss');
                    const day = format.substring(0, 7);
                    return day == el
                });
                const studentData = studentOne && studentOne.length > 0 && {
                    month: monthTextFun(el),
                    number: studentOne.length
                }
                studentOne && studentOne.length > 0 && studentList.push(studentData)
            });

            let genderList = [];
            const maleList = student && student.filter((el) => el.gender == 'erkak');
            if (maleList) {
                genderList.push({
                    name: "O'g'il bolalar soni",
                    number: maleList.length
                })
            }
            const womanList = student && student.filter((el) => el.gender == 'ayol');
            if (womanList) {
                genderList.push({
                    name: 'Qiz bolalar soni',
                    number: womanList.length
                })
            }

            const allStudent = {
                "Barcha o'quvchilar": student.length
            };

            const pendingStudentList = {
                "Kutish zalidagi o'quvchilar": pendingStudent.length
            };

            const debtors = await Debtors.findAll({
                where: {
                    status: 'active'
                }
            });
            const monthOne = new Date().getMonth() + 1;
            const currentMonth = new Date().getFullYear() + "-" + (monthOne <= 9 ? "0" : '') + '' + monthOne;
            let debtorsAllSumma = 0;
            let debtorsLastMonthSumma = 0;

            debtors && debtors.forEach((el) => {
                debtorsAllSumma = debtorsAllSumma + el.amount;
                if (el.month == currentMonth) {
                    debtorsLastMonthSumma = debtorsLastMonthSumma + el.amount
                }
            });

            const debtorsLastMonthData = debtors.filter((el) => el && el.month == currentMonth);

            const debtorsData = debtors && {
                all_summa: debtorsAllSumma ? debtorsAllSumma : 0,
                all_debtors: debtors && debtors.length > 0 ? debtors.length : 0,
                last_month_summa: debtorsLastMonthSumma ? debtorsLastMonthSumma : 0,
                last_month_debtors: debtorsLastMonthData && debtorsLastMonthData.length > 0 ? debtorsLastMonthData.length : 0,

            };

            const groupList = {
                groups_size: groups.length
            };


            const payDataLast = payments.filter((e) => {
                const format = dateFormat.format(e.createdAt, 'YYYY-MM-DD HH:mm:ss');
                const day = format.substring(0, 7);
                return day == month[0];
            });

            let lastMonthPay = 0;
            payDataLast.forEach((el) => {
                lastMonthPay = lastMonthPay + el.amount
            });



            const lastMonthData = {
                month: monthTextFun(month[0]),
                'Summa': lastMonthPay,
                count: payDataLast && payDataLast.length > 0 ? payDataLast.length : 0
            };

            res.json({ payData, studentList, genderList, allStudent, pendingStudentList, lastMonthData, groupList, debtorsData });
        } catch (error) {
            console.log(649, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
    async paymentChartType(req, res, next) {
        try {
            const { startDate, endDate } = req.body
            if ((!startDate || !endDate) || (!validateFun.isToday_2(startDate) || !validateFun.isToday_2(endDate)) || !validateFun.toCompare(startDate, endDate)) {
                return next(
                    ApiError.badRequest('An invalid value was entered in date')
                );
            };
            const query = `SELECT p.id, pt.payment_type, p.amount, p.created_at
            FROM payments p
            JOIN payment_types pt ON p.id::varchar(255) = pt.payment_id::varchar(255)
            WHERE p.created_at >= '${startDate} 00:01:01' -- replace with your actual startDate
              AND p.created_at <= '${endDate} 23:58:58' -- replace with your actual endDate
              AND p.status = 'active';
            `;
            const paymentAllType = [
                { name: 'Naqd pul orqali', value: 'cash' },
                { name: 'Payme', value: 'Payme' },
                { name: 'Click', value: 'Click' },
                { name: 'Uzumpay', value: 'Uzumpay' },
                { name: 'Zoomrad', value: 'Zoomrad' },
                { name: 'Paynet', value: 'Paynet' },
                { name: 'Oson', value: 'Oson' },
                { name: 'Alif mobi', value: 'AlifMobi' },
                { name: 'Anorbank', value: 'Anorbank' },
                { name: 'Beepul', value: 'Beepul' },
                { name: 'Davr Mobile', value: 'Davrmobile' },
                { name: 'Boshqa...', value: 'other' },
            ];
            const res_data = [];
            const data = await sequelize.query(query);
            if (data && data.length > 0 && data[0].length > 0) {
                paymentAllType.forEach((el) => {
                    const filterData = arrfilter(data[0], el.value, el.name);
                    res_data.push(filterData);
                    return;
                })
            }
            return res.json(res_data)
        } catch (error) {
            console.log(889, error.stack);
            return next(ApiError.badRequest(error));
        }
    }
}

module.exports = new PaymentsController();
