const ApiError = require("../error/ApiError");
const bcrypt = require("bcrypt");
const { User, Teachers, DndColumns } = require("../models/models");
const jwt = require("jsonwebtoken");
const validateFun = require("./validateFun");

const generateJwt = (id, email, role) => {
    return jwt.sign({ id, email, role }, process.env.SECRET_KEY, {
        expiresIn: "50m",
    });
};

class userController {
    async registration(req, res, next) {
        const { email, password, role, teacher_id } = req.body;

        if (!email || !password) {
            return next(ApiError.badRequest("Email yoki parol kiritilmadi!"));
        }

        const candidate = await User.findOne({ where: { email } });
        if (candidate) {
            return next(
                ApiError.badRequest(`Ushbu elektron pochta ro'yxattan o'tkazilgan`)
            );
        }

        const hashPassword = await bcrypt.hash(password, 5);
        const user = await User.create({
            email,
            password: hashPassword,
            teacher_id,
            role,
        });

        const token = generateJwt(user.id, user.email, user.role);
        return res.json({ token });
    }

    async registrationSupper(req, res, next) {
        const { email, password, telegram_id } = req.body;
        if (!email || !password) {
            return next(ApiError.badRequest("Email yoki parol kiritilmadi!"));
        }

        const candidate = await User.findOne({ where: { email, status: "active" } });
        if (candidate) {
            return next(
                ApiError.badRequest(`Ushbu elektron pochta ro'yxattan o'tkazilgan`)
            );
        }

        const dnd_columns = await DndColumns.findOne({
            where: {
                status: 'active',
                order: 1
            }
        });

        if (!dnd_columns) {
            DndColumns.create({
                name: "So'rovlar",
                order: 1
            });
        }

        const hashPassword = await bcrypt.hash(password, 5);
        const user = await User.create({
            email,
            password: hashPassword,
            role: 'super',
            telegram_id: telegram_id ? telegram_id : ""
        });

        const token = generateJwt(user.id, user.email, user.role);
        return res.json({ token });
    }

    async registrationAdmin(req, res, next) {
        const { email, password, telegram_id } = req.body;

        if (!email || !password) {
            return next(ApiError.badRequest("Email yoki parol kiritilmadi!"));
        }

        const candidate = await User.findOne({ where: { email, status: "active" } });
        if (candidate) {
            return next(
                ApiError.badRequest(`Ushbu elektron pochta ro'yxattan o'tkazilgan`)
            );
        }

        const hashPassword = await bcrypt.hash(password, 5);
        const user = await User.create({
            email,
            password: hashPassword,
            role: 'admin',
            telegram_id: telegram_id ? telegram_id : ""
        });

        const token = generateJwt(user.id, user.email, user.role);
        return res.json({ token });
    }

    async registrationTeacher(req, res, next) {
        const { email, password, teacher_id } = req.body;

        if (!teacher_id || !validateFun.isValidUUID(teacher_id)) {
            return next(
                ApiError.badRequest('Teacher not found')
            )
        } else {
            const teacher = await Teachers.findOne({
                where: {
                    status: 'active',
                    id: teacher_id
                }
            })
            if (!teacher) {
                return next(
                    ApiError.badRequest('Teacher not found')
                )
            }
        }

        if (!email || !password) {
            return next(ApiError.badRequest("Email yoki parol kiritilmadi!"));
        }

        const candidate = await User.findOne({ where: { email, status: "active" } });
        if (candidate) {
            return next(
                ApiError.badRequest(`Ushbu elektron pochta ro'yxattan o'tkazilgan`)
            );
        }

        const hashPassword = await bcrypt.hash(password, 5);
        const user = await User.create({
            email,
            password: hashPassword,
            teacher_id,
            role: 'teacher',
        });

        const token = generateJwt(user.id, user.email, user.role);
        return res.json({ token });
    }

    async login(req, res, next) {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email, status: 'active' } });
        if (!user) {
            return next(ApiError.internal("Bunday foydalanuvchi topilmadi"));
        }

        let comparePassword = bcrypt.compareSync(password, user.password);
        if (!comparePassword) {
            return next(ApiError.internal("Parol notogri kiritildi"));
        }
        const teacher = user.teacher_id && {
            id: user.teacher_id,
        };

        const token = generateJwt(user.id, user.email, user.role);
        res.json({ token, teacher, role: user.role });

    }

    async delete(req, res, next) {
        try {
            const { id } = req.body;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('no data found')
                )
            }
            if (id && validateFun.isValidUUID(id)) {
                const user = await User.findOne({ where: { id, status: "active" } });
                if (!user) {
                    return next(ApiError.badRequest("user topilmadi"));
                }
            }
            const userDelete = await User.destroy({ where: { id } });
            res.json(userDelete);
        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }

    async update(req, res, next) {
        try {
            const { id, email, password, telegram_id } = req.body;
            if (!id || !validateFun.isValidUUID(id)) {
                return next(
                    ApiError.badRequest('no data found')
                )
            }

            if (id && validateFun.isValidUUID(id)) {
                const user = await User.findOne({ where: { id, status: "active" } });
                if (!user) {
                    return next(ApiError.badRequest("user topilmadi"));
                }
            }

            const user = await User.findOne({
                where: { id, status: 'active' },
            });


            if (email) {
                const candidate = await User.findOne({ where: { email, status: 'active' } });
                if (candidate && candidate.id !== id) {
                    return next(
                        ApiError.badRequest(`Ushbu elektron pochta ro'yxattan o'tkazilgan`)
                    );
                }
                user.email = email;
            }
            if (telegram_id) {
                user.telegram_id = telegram_id;
            }

            if (password) {
                const hashPassword = await bcrypt.hash(password, 5);
                user.password = hashPassword;
            }

            const userSave = await user.save();
            return res.json({ userSave });
        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }

    async updateLoginOne(req, res, next) {
        try {
            const role = jwt.verify(
                req.headers.authorization.split(' ')[1],
                process.env.SECRET_KEY
            );
            if (role) {
                const { id, email, password } = req.body;
                if (!id || !validateFun.isValidUUID(id) || role.id != id) {
                    return next(
                        ApiError.badRequest('no data found')
                    );
                };

                if (!email) {
                    return next(
                        ApiError.badRequest('no email found')
                    );
                }

                if (!password) {
                    return next(
                        ApiError.badRequest('no password found')
                    );
                }

                const userOne = await User.findOne({ where: { email, status: 'active' } });

                if (userOne && userOne.id != id) {
                    return next(
                        ApiError.badRequest("Ushbu elektron pochta ro'yxattan o'tkazilgan")
                    )
                }

                const user = await User.findOne({
                    where: {
                        status: 'active',
                        id,
                        email: role.email
                    }
                });
                if (!user) {
                    return next(ApiError.badRequest('User not found'))
                }
                const hashPassword = await bcrypt.hash(password, 5);
                user.email = email;
                user.password = hashPassword;
                await user.save();

                return res.json('Login update filish');
            } else {
                ApiError.badRequest('Unregistered user')
            }


        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }

    async userGet(req, res, next) {
        try {
            const role = jwt.verify(
                req.headers.authorization.split(' ')[1],
                process.env.SECRET_KEY
            );

            const email = role.email;
            const user = await User.findOne({
                where: {
                    status: 'active',
                    email: email
                }
            });

            const teacher = user && await Teachers.findOne({
                where: {
                    status: 'active',
                    id: user.teacher_id
                }
            })

            const newData = user ? {
                id: user.id,
                email: user.email,
                telegram_id: user.telegram_id,
                data: teacher ? teacher : null
            } : null


            res.json(newData)

        } catch (error) {
            console.log(446, error.stack);
            return next(ApiError.badRequest(error));
        }
    }

    async check(req, res, next) {
        const token = generateJwt(req.user.id, req.user.email, req.user.role);
        res.json({ token });
    }
}

module.exports = new userController();
