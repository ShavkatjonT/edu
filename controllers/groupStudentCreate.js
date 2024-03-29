const { Debtors, LessonGroup, GroupSchedule, GroupStudents, TeacherStatistics, Teachers, TeacherGroups, Groups } = require("../models/models");
const CountWeekdays = require('./countWeekdays')
const month = async ({ student_id, group_id, day, summa, group_student_wallet_sum, in_time = false, in_stat = true }) => {
  try {
    const monthOne = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const date = new Date();
    const dayWeek = new Date().getDay();
    const currentMonth = new Date().getFullYear() + "-" + (monthOne <= 9 ? "0" : '') + '' + monthOne;
    const debtorsOne = await Debtors.findOne({
      where: {
        status: 'active',
        group_id,
        student_id,
        month: currentMonth
      }
    });

    const lessonGroupOne = await LessonGroup.findOne({
      where: {
        group_id,
        status: "active",
      },
    });

    const week_data = await GroupSchedule.findOne({
      where: {
        group_id,
        day_of_week: dayWeek
      }
    })

    const weekDay = lessonGroupOne && lessonGroupOne.lesson_day
      .split(",")
      .map((e) => Number(e))

    const lessonDay = CountWeekdays.countWeekdaysInMonth(monthOne, year, weekDay);
    const endData = CountWeekdays.getLastDateOfMonth(date);

    const time = (new Date().getHours() <= 9 ? "0" : '') + '' + new Date().getHours() + ':'
      + (new Date().getMinutes() <= 9 ? "0" : '') + '' + new Date().getMinutes() + ':' +
      (new Date().getSeconds() <= 9 ? "0" : '') + new Date().getSeconds();

    const lessonLastDay = CountWeekdays.countWeekdaysInRangeNew({
      week_day: weekDay,
      start_date: date,
      start_time_1: '01:00',
      start_time_2: false,
      end_date: endData,
      end_time_1: in_time ? week_data?.lesson_time ? week_data?.lesson_time : '01:00:00' : time,
      end_time_2: week_data?.lesson_time ? week_data?.lesson_time : false
    });

    const group_studentNew = await GroupStudents.findOne({
      where: {
        status: 'active',
        student_id,
        group_id,
      }
    });

    const amountSum = Math.trunc((lessonLastDay * summa) / lessonDay);
    let sum = 0;
    if (group_student_wallet_sum && amountSum && amountSum > 0) {
      const sum1 = group_student_wallet_sum - amountSum;
      if (sum1 > 0) {
        group_studentNew.wallet = (group_studentNew?.wallet ? group_studentNew?.wallet : 0) + sum1;
      } else if (sum1 == 0) {
        sum = 0;
      } else {
        sum = Math.abs(sum1)
      }
    } else if (group_student_wallet_sum && amountSum == 0) {
      group_studentNew.wallet = (group_studentNew?.wallet ? group_studentNew?.wallet : 0) + group_student_wallet_sum;
      sum = sum + 0
    } else {
      sum = amountSum + sum;
    }

    if (debtorsOne) {
      debtorsOne.amount = lessonGroupOne && Math.trunc(debtorsOne.amount + sum)
      debtorsOne.all_summa = lessonGroupOne && Math.trunc(debtorsOne.amount + sum)
      await debtorsOne.save()
    } else {
      lessonGroupOne && sum > 0 && await Debtors.create({
        student_id,
        group_id,
        month: currentMonth,
        amount: Math.trunc(sum),
        all_summa: Math.trunc(sum),
      });
    }

    const teacherGroup = await TeacherGroups.findOne({
      where: {
        status: 'active',
        group_id
      }
    });


    const teacher = teacherGroup && await Teachers.findOne({
      where: {
        status: 'active',
        id: teacherGroup.teacher_id
      }
    });

    const group = await Groups.findOne({
      where: {
        status: 'active',
        id: group_id
      }
    });
    if (in_stat) {
      await TeacherStatistics.create({
        group_id,
        student_id,
        student_status: 'add',
        student_count: group.count_students,
        teacher_id: teacher ? teacher.id : ''
      });

    }

    await group_studentNew.save()
    return 'Debtors add'
  } catch (error) {
    console.log(100, error.stack);
    return error;
  }
};

module.exports = month;
