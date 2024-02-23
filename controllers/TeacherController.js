const ApiError = require("../error/ApiError");
const {
    Teachers,
    TeacherGroups,
    Groups,
    Monthly,
    User,
    EmployeeNotes,
    Logs
} = require("../models/models");
const sendMessage = require("./sendMessageController");
const logSystemController = require("./logSystemController");
const validateFun = require("./validateFun");
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
function roleFun(agr) {
    let role = '';
    switch (agr) {
        case 'ceo':
            role = 'super'
            break;
        case 'admin':
            role = 'admin'
            break;
        case 'casher':
            role = 'casher'
            break;
        case 'teacher':
            role = 'teacher'
            break;

        default:
            break;
    }
    return role
}

function employeeGetFun(teacher) {
    const label = teacher.map((e) => {
        return {
            id: e.id,
            name: e.firstname + " " + e.lastname + " ",
            phone: e.phone,
            birthday: e.birthday,
            address: e.address,
            sciences: e.sciences,
            job_type: e.job_type
        };
    }).sort((a, b) => a.name.localeCompare(b.name));
    return label
}
class TeachersController {
    async employeeAdd(req, res, next) {
        try {
            const role = jwt.verify(
                req.headers.authorization.split(' ')[1],
                process.env.SECRET_KEY
            );
            if (role && role.role == 'super') {
                const {
                    firstname,
                    lastname,
                    fathername,
                    gender,
                    birthday,
                    address,
                    phone,
                    phone_2,
                    telegram_id,
                    job_type,
                    email,
                    password
                } = req.body;
                if (!firstname) {
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
                if (!phone_2) {
                    return next(ApiError.badRequest("Data is incomplete"));
                }
                if (!lastname) {
                    return next(ApiError.badRequest("Data is incomplete"));
                }
                if (!phone) {
                    return next(ApiError.badRequest("Data is incomplete"));
                }
                if (!password) {
                    return next(ApiError.badRequest("Password is incomplete"));
                }

                if (!email) {
                    return next(ApiError.badRequest("Email is incomplete"));
                } else {
                    const candidate = await User.findOne({
                        where: {
                            email,
                            [Op.or]: [
                                { status: "frozen" },
                                { status: "active" },
                            ],
                        }
                    });
                    if (candidate) {
                        return next(
                            ApiError.badRequest(`This email has been registered`)
                        );
                    };
                };
                const typeCeo = ['ceo', 'admin', 'casher', 'teacher'];
                if (!job_type || !typeCeo.includes(job_type)) {
                    return next(ApiError.badRequest("There is an error in the job type"));
                }

                const teacher = await Teachers.create({
                    firstname,
                    lastname,
                    fathername,
                    gender,
                    birthday,
                    address,
                    phone,
                    phone_2,
                    telegram_id,
                    job_type
                });
                const roleType = roleFun(job_type);
                const hashPassword = await bcrypt.hash(password, 5);
                if (roleType) {

                    await User.create({
                        email: email,
                        password: hashPassword,
                        role: roleType,
                        telegram_id: telegram_id ? telegram_id : "",
                        teacher_id: teacher.id,
                    });
                };

                const text = `${lastname} ${firstname} ismli hodimni qo'shdi`;
                await logSystemController.logsAdd({ reqdata: req, text });

                res.json({ teacher });
            } else {
                return next(
                    ApiError.badRequest('Changing user data is not allowed')
                )
            }

        } catch (error) {
            console.log(149, error.stack);
            return next(
                ApiError.badRequest(error)
            )
        }
    }
    async teacherAdd(req, res, next) {
        try {
            const role = jwt.verify(
                req.headers.authorization.split(' ')[1],
                process.env.SECRET_KEY
            );
            if (role && (role.role == 'admin' || role.role == 'super')) {
                const {
                    firstname,
                    lastname,
                    fathername,
                    gender,
                    birthday,
                    address,
                    phone,
                    phone_2,
                    telegram_id,
                    job_type,
                    email,
                    password
                } = req.body;
                if (!firstname) {
                    return next(ApiError.badRequest("Data is incomplete"));
                }
                if (!address) {
                    return next(ApiError.badRequest("Data is incomplete"));
                }
                if (!gender) {
                    return next(ApiError.badRequest("Data is incomplete"));
                }
                if (!phone_2) {
                    return next(ApiError.badRequest("Data is incomplete"));
                }
                if (!birthday) {
                    return next(ApiError.badRequest("Data is incomplete"));
                }
                if (!lastname) {
                    return next(ApiError.badRequest("Data is incomplete"));
                }
                if (!phone) {
                    return next(ApiError.badRequest("Data is incomplete"));
                }
                if (!password) {
                    return next(ApiError.badRequest("Password is incomplete"));
                }

                if (!email) {
                    return next(ApiError.badRequest("Email is incomplete"));
                } else {
                    const candidate = await User.findOne({
                        where: {
                            email,
                            [Op.or]: [
                                { status: "frozen" },
                                { status: "active" },
                            ],
                        }
                    });
                    if (candidate) {
                        return next(
                            ApiError.badRequest(`This email has been registered`)
                        );
                    };
                };

                if (!job_type || job_type != 'teacher') {
                    return next(ApiError.badRequest("There is an error in the job type"));
                }

                const teacher = await Teachers.create({
                    firstname,
                    lastname,
                    fathername,
                    gender,
                    birthday,
                    address,
                    phone,
                    phone_2,
                    telegram_id,
                    job_type
                });
                const hashPassword = await bcrypt.hash(password, 5);
                await User.create({
                    email,
                    password: hashPassword,
                    role: 'teacher',
                    telegram_id: telegram_id ? telegram_id : "",
                    teacher_id: teacher.id
                });
                const text = `${lastname} ${firstname} ismli hodimni qo'shdi`;
                await logSystemController.logsAdd({ reqdata: req, text })
                res.json({ teacher });
            } else {
                return next(
                    ApiError.badRequest('Changing user data is not allowed')
                )
            }

        } catch (error) {
            console.log(236, error.stack);
            return next(
                ApiError.badRequest(error)
            )
        }
    }
    async teacherDelete(req, res, next) {
        try {
            const role = jwt.verify(
                req.headers.authorization.split(' ')[1],
                process.env.SECRET_KEY
            );
            if (role && role.role == 'admin') {
                const { id } = req.params;
                if (!validateFun.isValidUUID(id)) {
                    return next(ApiError.badRequest("The data was entered incorrectly"));
                }
                const teacherById = await Teachers.findOne({ where: { id, status: 'active', job_type: "teacher" } });
                if (!teacherById) {
                    return next(
                        ApiError.badRequest(`Ushbu ${id} idli malumotlar topilmadi`)
                    );
                }
                const teacherUser = await User.findOne({
                    where: {
                        status: 'active',
                        teacher_id: id
                    }
                })
                if (teacherUser) {
                    teacherUser.status = "inactive";
                    await teacherUser.save();
                }

                teacherById.status = "inactive";
                const teacherDeletes = await teacherById.save();
                if (!teacherDeletes) {
                    return next(
                        ApiError.badRequest(
                            `Ush bu ${id} id tegishli malumotlarni o'zgartirib bo'lmadi`
                        )
                    );
                }
                const text = `${teacherById?.lastname ? teacherById?.lastname : ''} ${teacherById?.firstname ? teacherById?.firstname : ''} ismli hodimni bazadan o'chirdi`;
                await logSystemController.logsAdd({ reqdata: req, text })
                res.json({ teacherDeletes });
            } else {
                return next(
                    ApiError.badRequest('Changing user data is not allowed')
                )
            }

        } catch (error) {
            return next(
                ApiError.badRequest(error)
            )
        }
    }
    async employeeDelete(req, res, next) {
        try {
            const role = jwt.verify(
                req.headers.authorization.split(' ')[1],
                process.env.SECRET_KEY
            );
            if (role && role.role == 'super') {
                const { id } = req.params;
                if (!validateFun.isValidUUID(id)) {
                    return next(ApiError.badRequest("The data was entered incorrectly"));
                }
                const teacherById = await Teachers.findOne({ where: { id, status: 'active' } });
                if (!teacherById) {
                    return next(
                        ApiError.badRequest(`Ushbu ${id} idli malumotlar topilmadi`)
                    );
                }
                const teacherUser = await User.findOne({
                    where: {
                        status: 'active',
                        teacher_id: id
                    }
                })
                if (teacherUser) {
                    teacherUser.status = "inactive";
                    await teacherUser.save();
                }

                teacherById.status = "inactive";
                const teacherDeletes = await teacherById.save();
                if (!teacherDeletes) {
                    return next(
                        ApiError.badRequest(
                            `Ush bu ${id} id tegishli malumotlarni o'zgartirib bo'lmadi`
                        )
                    );
                }
                const text = `${teacherById?.lastname ? teacherById?.lastname : ''} ${teacherById?.firstname ? teacherById?.firstname : ''} ismli hodimni bazadan o'chirdi`;
                await logSystemController.logsAdd({ reqdata: req, text });
                res.json({ teacherDeletes });
            } else {
                return next(
                    ApiError.badRequest('Changing user data is not allowed')
                )
            }

        } catch (error) {
            return next(
                ApiError.badRequest(error)
            )
        }
    }
    async teacherPut(req, res, next) {
        try {
            const role = jwt.verify(
                req.headers.authorization.split(' ')[1],
                process.env.SECRET_KEY
            );
            if (role && role.role == 'admin') {
                const { id } = req.params;
                if (!validateFun.isValidUUID(id)) {
                    return next(ApiError.badRequest("The data was entered incorrectly"));
                }
                const {
                    firstname,
                    lastname,
                    fathername,
                    gender,
                    birthday,
                    address,
                    phone,
                    phone_2,
                    telegram_id,
                    job_type,
                    email,
                    password,
                } = req.body;

                if (!firstname) {
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
                if (!phone) {
                    return next(ApiError.badRequest("Data is incomplete"));
                }
                if (!phone_2) {
                    return next(ApiError.badRequest("Data is incomplete"));
                }
                if (!password) {
                    return next(ApiError.badRequest("Password is incomplete"));
                }
                if (!email) {
                    return next(ApiError.badRequest("Email is incomplete"));
                } else {
                    const candidate = await User.findOne({
                        where: {
                            email,
                            [Op.or]: [
                                { status: "frozen" },
                                { status: "active" },
                            ],
                        }
                    });
                    if (candidate && id != candidate.teacher_id) {
                        return next(
                            ApiError.badRequest(`This email has been registered`)
                        );
                    };
                };
                if (!job_type || job_type != 'teacher') {
                    return next(ApiError.badRequest("There is an error in the job type"));
                }

                const teacherById = await Teachers.findOne({ where: { id } });
                const user = await User.findOne({
                    where: {
                        status: 'active',
                        teacher_id: id,
                        role: 'teacher',
                    }
                });
                if (user) {
                    const hashPassword = await bcrypt.hash(password, 5);
                    user.email = email;
                    user.password = hashPassword;
                    user.role = 'teacher';
                    user.telegram_id = telegram_id ? telegram_id : '';
                    await user.save();
                } else {
                    const hashPassword = await bcrypt.hash(password, 5);
                    await User.create({
                        email: email,
                        password: hashPassword,
                        role: 'teacher',
                        telegram_id: telegram_id ? telegram_id : "",
                        teacher_id: id,
                    })
                };
                if (!teacherById) {
                    return next(ApiError.badRequest(`Ushbu idli o'quvchi topilmadi`));
                }
                if (firstname) teacherById.firstname = firstname;
                if (gender) teacherById.gender = gender;
                if (birthday) teacherById.birthday = birthday;
                if (lastname) teacherById.lastname = lastname;
                if (fathername) teacherById.fathername = fathername;
                if (address) teacherById.address = address;
                if (phone) teacherById.phone = phone;
                if (phone_2) teacherById.phone_2 = phone_2;
                if (telegram_id) teacherById.telegram_id = telegram_id;
                if (job_type) teacherById.job_type = job_type;
                const teachersUpdate = await teacherById.save();
                if (!teachersUpdate) {
                    return next(
                        ApiError.badRequest(
                            `Ush bu ${id} id tegishli malumotlarni o'zgartirib bo'lmadi`
                        )
                    );
                }

                const text = `${teacherById?.lastname ? teacherById?.lastname : ''} ${teacherById?.firstname ? teacherById?.firstname : ''} ismli hodimni malumotlarni o'zgartirildi`;
                await logSystemController.logsAdd({ reqdata: req, text });
                res.json({ teachersUpdate });
            }

        } catch (error) {
            return next(
                ApiError.badRequest(error)
            )
        }
    }
    async employeePut(req, res, next) {
        try {
            const role = jwt.verify(
                req.headers.authorization.split(' ')[1],
                process.env.SECRET_KEY
            );
            if (role && role.role == 'super') {
                const { id } = req.params;
                if (!validateFun.isValidUUID(id)) {
                    return next(ApiError.badRequest("The data was entered incorrectly"));
                }
                const {
                    firstname,
                    lastname,
                    fathername,
                    gender,
                    birthday,
                    address,
                    phone,
                    phone_2,
                    telegram_id,
                    job_type,
                    email,
                    password
                } = req.body;


                if (!firstname) {
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
                if (!phone) {
                    return next(ApiError.badRequest("Data is incomplete"));
                }
                if (!phone_2) {
                    return next(ApiError.badRequest("Data is incomplete"));
                }
                if (!password) {
                    return next(ApiError.badRequest("Password is incomplete"));
                }
                if (!email) {
                    return next(ApiError.badRequest("Email is incomplete"));
                } else {
                    const candidate = await User.findOne({
                        where: {
                            email,
                            [Op.or]: [
                                { status: "frozen" },
                                { status: "active" },
                            ],
                        }
                    });
                    if (candidate && id != candidate.teacher_id) {
                        return next(
                            ApiError.badRequest(`This email has been registered`)
                        );
                    };
                };
                const typeCeo = ['ceo', 'admin', 'casher', 'teacher'];
                if (!job_type || !typeCeo.includes(job_type)) {
                    return next(ApiError.badRequest("There is an error in the job type"));
                }
                const teacherById = await Teachers.findOne({ where: { id, status: 'active' } });
                if (!teacherById) {
                    return next(ApiError.badRequest(`No teacher found for this ID`));
                };
                const user = await User.findOne({
                    where: {
                        status: 'active',
                        teacher_id: id
                    }
                });
                if (teacherById.job_type == 'teacher' && job_type != 'teacher') {
                    await TeacherGroups.update({
                        status: 'inactive'
                    }, {
                        where: {
                            status: 'active',
                            teacher_id: id
                        }
                    });
                }
                if (user) {
                    const roleType = roleFun(job_type);
                    const hashPassword = await bcrypt.hash(password, 5);
                    user.email = email;
                    user.password = hashPassword;
                    user.role = roleType;
                    user.telegram_id = telegram_id ? telegram_id : '';
                    await user.save();
                } else {
                    const roleType = roleFun(job_type);
                    const hashPassword = await bcrypt.hash(password, 5);
                    await User.create({
                        email: email,
                        password: hashPassword,
                        role: roleType,
                        telegram_id: telegram_id ? telegram_id : "",
                        teacher_id: id,
                    })
                };
                if (firstname) teacherById.firstname = firstname;
                if (gender) teacherById.gender = gender;
                if (birthday) teacherById.birthday = birthday;
                if (lastname) teacherById.lastname = lastname;
                if (fathername) teacherById.fathername = fathername;
                if (address) teacherById.address = address;
                if (phone) teacherById.phone = phone;
                if (phone_2) teacherById.phone_2 = phone_2;
                if (telegram_id) teacherById.telegram_id = telegram_id;
                if (job_type) teacherById.job_type = job_type;



                const teachersUpdate = await teacherById.save();
                if (!teachersUpdate) {
                    return next(
                        ApiError.badRequest(
                            `Ush bu ${id} id tegishli malumotlarni o'zgartirib bo'lmadi`
                        )
                    );
                }
                const text = `${teacherById?.lastname ? teacherById?.lastname : ''} ${teacherById?.firstname ? teacherById?.firstname : ''} ismli hodimni malumotlarni o'zgartirildi`;
                await logSystemController.logsAdd({ reqdata: req, text })
                res.json({ teachersUpdate });
            } else {
                return next(
                    ApiError.badRequest('Changing user data is not allowed')
                )
            }


        } catch (error) {
            return next(
                ApiError.badRequest(error)
            )
        }
    }
    async employeePut_2(req, res, next) {
        try {
            const role = jwt.verify(
                req.headers.authorization.split(' ')[1],
                process.env.SECRET_KEY
            );
            if (role) {
                const {
                    id,
                    user_id,
                    firstname,
                    lastname,
                    fathername,
                    gender,
                    birthday,
                    address,
                    phone,
                    phone_2,
                    telegram_id,
                    email,
                    password
                } = req.body;

                if (!id || !validateFun.isValidUUID(id)) {
                    return next(ApiError.badRequest("The data was entered incorrectly"));
                }

                if (!user_id || !validateFun.isValidUUID(user_id) || role.id != user_id) {
                    return next(ApiError.badRequest("The data was entered incorrectly"));
                }

                if (!firstname) {
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
                if (!phone) {
                    return next(ApiError.badRequest("Data is incomplete"));
                }
                if (!phone_2) {
                    return next(ApiError.badRequest("Data is incomplete"));
                }
                if (!password) {
                    return next(ApiError.badRequest("Password is incomplete"));
                }
                if (!email) {
                    return next(ApiError.badRequest("Email is incomplete"));
                } else {
                    const candidate = await User.findOne({
                        where: {
                            email,
                            [Op.or]: [
                                { status: "frozen" },
                                { status: "active" },
                            ],
                        }
                    });
                    if (candidate && id != candidate.teacher_id) {
                        return next(
                            ApiError.badRequest(`This email has been registered`)
                        );
                    };
                };
                const teacherById = await Teachers.findOne({ where: { id, status: 'active' } });
                if (!teacherById) {
                    return next(ApiError.badRequest(`No teacher found for this ID`));
                };
                const user = await User.findOne({
                    where: {
                        status: 'active',
                        teacher_id: id,
                        id: user_id,
                    }
                });
                if (user) {
                    const hashPassword = await bcrypt.hash(password, 5);
                    user.email = email;
                    user.password = hashPassword;
                    user.telegram_id = telegram_id ? telegram_id : '';
                    await user.save();
                } else {
                    return next(ApiError.badRequest("The data was entered incorrectly"));
                }
                if (firstname) teacherById.firstname = firstname;
                if (gender) teacherById.gender = gender;
                if (birthday) teacherById.birthday = birthday;
                if (lastname) teacherById.lastname = lastname;
                if (fathername) teacherById.fathername = fathername;
                if (address) teacherById.address = address;
                if (phone) teacherById.phone = phone;
                if (phone_2) teacherById.phone_2 = phone_2;
                if (telegram_id) teacherById.telegram_id = telegram_id;
                const teachersUpdate = await teacherById.save();
                if (!teachersUpdate) {
                    return next(
                        ApiError.badRequest(
                            `Ush bu ${id} id tegishli malumotlarni o'zgartirib bo'lmadi`
                        )
                    );
                }
                const text = `${teacherById?.lastname ? teacherById?.lastname : ''} ${teacherById?.firstname ? teacherById?.firstname : ''} ismli hodim o'zini malumotlarni o'zgartirildi`;
                await logSystemController.logsAdd({ reqdata: req, text })
                res.json({ teachersUpdate });
            } else {
                return next(
                    ApiError.badRequest('Changing user data is not allowed')
                )
            }


        } catch (error) {
            return next(
                ApiError.badRequest(error)
            )
        }
    }
    async teacherGet(req, res, next) {
        try {
            const teachers = await Teachers.findAll({
                where: { status: "active", job_type: 'teacher', },
            });
            res.json(teachers);
        } catch (error) {
            return next(
                ApiError.badRequest(error)
            )
        }
    }
    async teacherLabelGet(req, res, next) {
        try {
            const teachers = await Teachers.findAll({
                where: {
                    status: "active",
                    job_type: 'teacher',
                },
            });
            const label = teachers.map(async (e) => {
                return {
                    id: e.id,
                    name: e.firstname + " " + e.lastname + " " + e.fathername,
                };
            })

            const teacherFuc = async () => {
                const map1 = await Promise.all(label.map(async (e) => await e));
                return res.json(map1);
            };
            const teacherResult = teacherFuc();
            return teacherResult;
        } catch (error) {
            return next(
                ApiError.badRequest(error)
            )
        }
    }
    async teacherGetOne(req, res, next) {
        try {
            const { id } = req.params;
            if (!validateFun.isValidUUID(id)) {
                return next(ApiError.badRequest("The data was entered incorrectly"));
            }
            const teacherGroup = await TeacherGroups.findAll({
                where: {
                    status: "active",
                    teacher_id: id,
                },
            });
            const group = await Groups.findAll({
                where: {
                    status: "active",
                },
            });
            const teachers = await Teachers.findOne({
                where: { id, status: "active", },
            });
            let groupListOne = [];
            teacherGroup.map((el) => {
                let groupOne = group.find((e) => e.id == el.group_id);
                return groupListOne.push(groupOne);
            });

            const user = await User.findOne({
                where: {
                    teacher_id: id,
                    [Op.or]: [
                        { status: "frozen" },
                        { status: "active" },
                    ],
                }
            });
            let teacherList = {
                firstname: teachers.firstname,
                lastname: teachers.lastname,
                fathername: teachers.fathername,
                gender: teachers.gender,
                birthday: teachers.birthday,
                address: teachers.address,
                phone: teachers.phone,
                telegram_id: teachers?.telegram_id ? teachers?.telegram_id : '',
                phone_2: teachers?.phone_2 ? teachers?.phone_2 : '',
                wallet: teachers.wallet,
                group: groupListOne && groupListOne,
                job_type: teachers?.job_type ? teachers.job_type : '',
                email: user?.email ? user.email : ''
            };

            res.json(teacherList);
        } catch (error) {
            return next(
                ApiError.badRequest(error)
            )
        }
    }
    async employeeAllListGet(req, res, next) {
        try {
            const role = jwt.verify(
                req.headers.authorization.split(' ')[1],
                process.env.SECRET_KEY
            );

            // const jobType = ['ceo', 'admin', 'casher', 'teacher'];
            const teachers = await Teachers.findAll({
                where: {
                    status: "active",
                },
            });
            const ceo = teachers.filter((el) => el && el?.job_type && el.job_type == 'ceo');
            const admin = teachers.filter((el) => el && el?.job_type && el.job_type == 'admin');
            const casher = teachers.filter((el) => el && el?.job_type && el.job_type == 'casher');
            const teacher = teachers.filter((el) => el && el?.job_type && el.job_type == 'teacher');
            const ceoData = ceo && ceo.length > 0 ? employeeGetFun(ceo) : [];
            const adminData = admin && admin.length > 0 ? employeeGetFun(admin) : [];
            const casherData = casher && casher.length > 0 ? employeeGetFun(casher) : [];
            const teacherData = teacher && teacher.length > 0 ? employeeGetFun(teacher) : [];

            return res.json({
                ceoData,
                adminData,
                casherData,
                teacherData,
            });
        } catch (error) {
            return next(
                ApiError.badRequest(error)
            )
        }
    }
    async teacherAllListGet(req, res, next) {
        try {
            const teachers = await Teachers.findAll({
                where: {
                    status: "active",
                    job_type: 'teacher',
                },
            });
            const label = teachers.map((e) => {
                return {
                    id: e.id,
                    name: e.firstname + " " + e.lastname + " ",
                    phone: e.phone,
                    birthday: e.birthday,
                    address: e.address,
                    sciences: e.sciences,
                };
            }).sort((a, b) => a.name.localeCompare(b.name));;

            const teacherFuc = async () => {
                const map1 = await Promise.all(label.map(async (e) => await e));
                return res.json(map1);
            };
            const teacherResult = teacherFuc();
            return teacherResult;
        } catch (error) {
            return next(
                ApiError.badRequest(error)
            )
        }
    }
    async teacherAllListLoginGet(req, res, next) {
        try {
            const teachers = await Teachers.findAll({
                where: {
                    status: "active",
                },
            });

            const user = await User.findAll({
                where: {
                    role: "teacher",
                    status: 'active'
                }
            });

            const teacherSort = teachers && teachers.sort((a, b) => a.firstname.localeCompare(b.firstname));

            const label = teacherSort.map(async (el) => {
                const teacherOne = user && user.find((e) => e.teacher_id == el.id)
                const data = !teacherOne && {
                    id: el.id,
                    name: el.firstname + " " + el.lastname + " " + el.fathername,
                }
                return data
            });

            const teacherFuc = async () => {
                const map1 = await Promise.all(label.map(async (e) => await e));
                return res.json(map1);
            };
            const teacherResult = teacherFuc();
            return teacherResult;
        } catch (error) {
            return next(
                ApiError.badRequest(error)
            )
        }
    }
    async teacherAllListCabinet(req, res, next) {
        try {
            const teachers = await Teachers.findAll({
                where: {
                    status: "active",

                },
            });

            const user = await User.findAll({
                where: {
                    [Op.or]: [
                        { role: "teacher" },
                        { role: "admin" },
                    ],
                    status: 'active'
                }
            });
            const adminData = user.filter((e) => e && e?.role && e.role == 'admin').map((el) => {
                return {
                    id: el.id,
                    email: el.email,
                    telegram_id: el?.telegram_id ? el.telegram_id : ''
                }
            }).filter((el) => el && el);

            const label = teachers.map((el) => {
                const teacherOne = user && user.find((e) => e && e?.role && e.role == 'teacher' && e.teacher_id == el.id);
                const data = teacherOne && {
                    id: teacherOne.id,
                    name: el.firstname + " " + el.lastname + " " + el.fathername,
                    teacher_id: el.id,
                    email: teacherOne.email
                }
                return data
            }).sort((a, b) => a.name.localeCompare(b.name));



            const filterData = label.filter((e) => e && e);
            res.json({ filterData, adminData });

        } catch (error) {
            return next(
                ApiError.badRequest(error)
            )
        }
    }
    async teacherAddPaymet(req, res, next) {
        try {
            const { id } = req.params;
            if (!validateFun.isValidUUID(id)) {
                return next(ApiError.badRequest("The data was entered incorrectly"));
            }
            const { payment, month } = req.body;

            const teacher = await Teachers.findOne({
                where: { id, status: "active" },
            });

            if (!teacher) {
                return next(ApiError.badRequest("O'qtuvchi topilmadi"));
            }
            if (!payment) {
                return next(ApiError.badRequest("to'lov qilingan suma yo'q "));
            } else {
                let inNumber = typeof payment;
                if (inNumber !== "number") {
                    return next(ApiError.badRequest("Summani raqamda kiriting"));
                }
                if (payment > 10000000) {
                    return next(
                        ApiError.badRequest(
                            "Berilban summa o'nmilyondan kop summani kamaytiring"
                        )
                    );
                }
            }
            if (!month) {
                return next(ApiError.badRequest("Yil va oy kriltilmadi"));
            } else {
                let inString = typeof month;
                if (inString !== "string") {
                    return next(ApiError.badRequest("string emas"));
                }
            }

            const monthText = month.substring(5);
            const years = month.substring(0, 4);

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



            const monthly = await Monthly.create({
                teacher_id: id,
                payment,
                month,
            });

            if (!monthly) {
                return next(
                    ApiError.badRequest('Malumotlarni saqlab bo\'lmadi')
                )
            }
            teacher.wallet = teacher.wallet - payment;
            const teacherPay = await teacher.save();

            const sendData = [
                {
                    phone: teacher.phone,
                    text: `"Vim" o'quv markazi: Hurmatli ${teacher.firstname + " " + teacher.lastname} sizga ${years}-yil ${monthPay} oyi uchun ${payment} so'm miqdorda oylik maosh berildi.`,
                },
            ];

            const text = `${teacher?.lastname ? teacher?.lastname : ''} ${teacher?.firstname ? teacher?.firstname : ''} ismli xodimga ${years}-yil ${monthPay} oyi uchun ${payment} so'm miqdorda oylik maosh berdi`;
            await logSystemController.logsAdd({ reqdata: req, text });

            sendMessage(sendData);

            res.json({ teacherPay, monthly });
        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }

    async employeeListGet(req, res, next) {
        try {
            const teachers = await Teachers.findAll({
                where: {
                    status: "active",
                },
            });

            const user = await User.findAll({
                where: {
                    status: 'active'
                }
            });

            const employeeListData = teachers.map((el) => {
                const userOne = user.find((e) => el.id == e.teacher_id);
                return userOne && {
                    id: el.id,
                    name: el.firstname + ' ' + el.lastname,
                    user_id: userOne.id
                }
            }).filter((el) =>  el && el );


            return res.json(employeeListData);
        } catch (error) {
            console.log(1173, error.stack);
            return next(
                ApiError.badRequest(error)
            )
        }
    }


}

module.exports = new TeachersController();
