require("dotenv").config();
const express = require("express");
const sequelize = require("./db");
const cors = require("cors");
const models = require("./models/models");
const router = require("./routes/index");
const PORT = process.env.PORT || 5000;
const errorHandler = require("./middleware/ErrorHandlingMiddlware");
const setDebtors = require('./controllers/cronController');
const birthday = require('./controllers/birthdayController');
const messageDelete = require('./controllers/messagesController')
const bodyParser = require('body-parser');
const TelegramBot = require('./controllers/telegramBot');
// const send = require('./controllers/examsController')
const groups = require('./controllers/groupsController')
const CronJob = require('cron').CronJob;
const tokenController = require('./controllers/tokenController');
const logSystemController = require('./controllers/logSystemController');

process.env.TZ = 'Asia/Tashkent';
// cron job ni ulash 
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use("/api", router);
app.use(errorHandler);
app.use((req, res, next) => {
    res.header({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
        "Access-Control-Allow-Headers": "*",
    });
    next();
});



app.post('/test/set-debtors', async (req, res) => {
    const { key } = req.body;
    if (key == 'hakunamatata') {
        const result = await setDebtors.fiveDay();
        res.json(result)
    } else {
        res.send('kalit kelmadi')
    }
});

app.post('/test/set-attendansi', async (req, res) => {
    const { key } = req.body;
    if (key == 'hakunamatata') {
        const result = await groups.groupAttendansiOneCron();
        res.json(result)
    } else {
        res.send('kalit kelmadi')
    }
});

app.get('/', async (req, res) => {
    console.log("other changed");
    res.json('hello')
})


// app.get('/twent-day', async (req, res) => {
//     const result = await setDebtors.twentyDay()
//     res.json(result)
// })

// app.get('/birthday', async (req, res) => {
//     const result = await birthday.sendBirthdayData()
//     res.json(result)
// })

// app.get('/second-sms', async (req, res) => {
//     const result = await setDebtors.secondSms()
//     res.json(result)
// })


const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();

        app.listen(PORT, () => {
            console.log(`Server run ${PORT} ...`);
        });
    } catch (error) {
        console.log(error);
    }
};
TelegramBot.start();

start();


// Bu yerda Asia/Tashkent vaqti boyicha sana qoyilgan
var jobFive = new CronJob(
    '0 0 7 1 * *',
    async () => {
        await setDebtors.fiveDay();
        await logSystemController.logsDeleteCron()
    },
    null,
    true,
    'Asia/Tashkent'
);

jobFive.start();

var jobToken = new CronJob(
    '0 0 8 1-30 * *',
    async () => {
        const today = new Date().getDate();
        const day = [1, 15, 28,]
        if (day.includes(today)) {
            await tokenController.generateNewToken()
        }
    },
    null,
    true,
    'Asia/Tashkent'
);

jobToken.start();

// Bu yerda Asia/Tashkent vaqti boyicha sana qoyilgan
var jobLesson = new CronJob(
    '0 0 6 * * *',
    async () => { await groups.groupAttendansiOneCron() },
    null,
    true,
    'Asia/Tashkent'
);

jobLesson.start()

var jobCron = new CronJob(
    '0 15 6-21 * * *',
    async () => { await groups.groupAttendansiOneCron_2() },
    null,
    true,
    'Asia/Tashkent'
);

jobCron.start();


var jobTwenty = new CronJob(
    '0 0 7 5 * *',
    async () => { await setDebtors.twentyDay() },
    null,
    true,
    'Asia/Tashkent'
);

jobTwenty.start()

var jobBirthday = new CronJob(
    '0 0 9 * * *',
    async () => {
        await birthday.sendBirthdayData()
        await messageDelete.messageDelete();
    },
    null,
    true,
    'Asia/Tashkent'
);

jobBirthday.start()

var jobScondSms = new CronJob(
    '0 0 7 28-31 * *',
    async () => {
        const today = new Date();
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        if (today.getDate() === lastDayOfMonth) {
            await setDebtors.secondSms();
        }
    },
    null,
    true,
    'Asia/Tashkent'
);

jobScondSms.start();
