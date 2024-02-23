const {
  Payments,
  TeacherGroups,
  Teachers,
  GroupStudents,
  Debtors,
  PaymentTypes,
  Groups,
  Students
} = require("../models/models");
const logSystemController = require("./logSystemController");

const deleteFun = async ({ id, update, req }) => {
  try {
    const paymentsById = await Payments.findOne({ where: { id, status: 'active' } });
    await PaymentTypes.update({ status: 'inactive' }, {
      where: {
        status: 'active',
        payment_id: id
      }
    })
    if (!paymentsById) {
      return next(ApiError.badRequest(`Ushbu ${id} idli malumotlar topilmadi`));
    };
    const groupStudent = await GroupStudents.findOne({
      where: {
        id: paymentsById.group_student_id,
      },
    });
    let debtorSumma = 0
    if (paymentsById.debtors_id && paymentsById.debtors_id.length > 0) {
      for (const data of paymentsById.debtors_id) {
        const debtorsOne = data.id && await Debtors.findOne({
          where: {
            id: data.id
          }
        });

        if (debtorsOne) {
          debtorSumma = Math.trunc(data.summa + debtorSumma);
          debtorsOne.amount = data.saleTrue ? data.summa : Math.trunc((debtorsOne.amount ? debtorsOne.amount : 0) + data.summa + (data.sale ? data.sale : 0));
          debtorsOne.status = 'active';
          await debtorsOne.save()
        }
      }
    }

    const techerGroup = await TeacherGroups.findOne({
      where: {
        group_id: groupStudent.group_id,
        status: "active",
      },
    });

    const techer =
      techerGroup &&
      (await Teachers.findOne({
        where: {
          status: "active",
          job_type: 'teacher',
          id: techerGroup.teacher_id,
        },
      }));

    if (techer) {
      techer.wallet = techer.wallet - paymentsById.teacher_sum;
      techer.save();
    };

    const updateSum = paymentsById.amount - debtorSumma;

    if (updateSum >= 0) {
      groupStudent.wallet = 0;
      groupStudent.save();
    };

    const student = await Students.findOne({
      where: {
        id: groupStudent.student_id
      }
    });

    const groups = await Groups.findOne({
      where: {
        id: groupStudent.group_id
      }
    })

    if (!update) {
      const text = `${student?.lastname ? student?.lastname : ''} ${student?.firstname ? student?.firstname : ''} ismli o'quvchiga ${groups.name} guruhga to'lov malumotlari o'chirildi.`;
      await logSystemController.logsAdd({ reqdata: req, text });
    }

    paymentsById.status = "inactive";
    paymentsById.save();
    return paymentsById;
  } catch (error) {
    return error;
  }
};

module.exports = deleteFun;
