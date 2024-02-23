const sequelize = require("../db");
const { DataTypes, Model } = require("sequelize");
const { Sequelize } = require("../db");
const User = sequelize.define("user", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  telegram_id: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, },
  password: { type: DataTypes.STRING },
  teacher_id: { type: DataTypes.STRING },
  lastname: { type: DataTypes.STRING },
  firstname: { type: DataTypes.STRING },
  gender: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, defaultValue: "USER" },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },

});
const FreezeUsers = sequelize.define('freeze_users', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  user_id: { type: DataTypes.STRING },
  start_date: { type: DataTypes.STRING },
  start_time: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  end_date: { type: DataTypes.STRING },
  end_time: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const Students = sequelize.define("students", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  firstname: { type: DataTypes.STRING },
  gender: { type: DataTypes.STRING },
  birthday: { type: DataTypes.STRING },
  lastname: { type: DataTypes.STRING },
  fathername: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
  fatherPhone: { type: DataTypes.STRING },
  motherPhone: { type: DataTypes.STRING },
  science: { type: DataTypes.JSON },
  dtmcolumns_id: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  blacklist_id: { type: DataTypes.JSON },
  rating: { type: DataTypes.STRING, defaultValue: 10 },
  class: { type: DataTypes.STRING },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const Groups = sequelize.define("groups", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  room_id: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING },
  wallet: { type: DataTypes.INTEGER },
  sale: { type: DataTypes.INTEGER },
  month_payment: { type: DataTypes.INTEGER },
  count_students: { type: DataTypes.STRING, defaultValue: "0" },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const Teachers = sequelize.define("teachers", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  firstname: { type: DataTypes.STRING },
  lastname: { type: DataTypes.STRING },
  fathername: { type: DataTypes.STRING },
  wallet: { type: DataTypes.INTEGER },
  gender: { type: DataTypes.STRING },
  birthday: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  phone_2: { type: DataTypes.STRING },
  telegram_id: { type: DataTypes.STRING },
  job_type: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const Sciences = sequelize.define("sciences", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const Payments = sequelize.define("payments", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  group_student_id: {
    type: DataTypes.STRING,
  },
  amount: { type: DataTypes.INTEGER },
  teacher_sum: { type: DataTypes.INTEGER },
  sale: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  debtors_id: { type: DataTypes.JSON },
  debtors_active: { type: DataTypes.INTEGER, defaultValue: 0 },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const PaymentTypes = sequelize.define("payment_types", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  payment_id: {
    type: DataTypes.STRING,
  },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  payment_type: {
    type: DataTypes.STRING,
  },
  student_id: {
    type: DataTypes.STRING,
  },
  group_id: {
    type: DataTypes.STRING,
  },
  group_student_id: {
    type: DataTypes.STRING,
  },


  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const Debtors = sequelize.define("debtors", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  student_id: {
    type: DataTypes.STRING,
  },
  group_id: {
    type: DataTypes.STRING,
  },
  amount: { type: DataTypes.INTEGER },
  all_summa: { type: DataTypes.INTEGER },
  month: { type: DataTypes.STRING },
  note: { type: DataTypes.TEXT, defaultValue: '' },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const GroupStudents = sequelize.define("group_students", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  wallet: { type: DataTypes.INTEGER, defaultValue: 0 },
  student_id: {
    type: DataTypes.STRING,
  },
  group_id: {
    type: DataTypes.STRING,
  },
  month_payment: { type: DataTypes.INTEGER, defaultValue: 0 },
  status_count: { type: DataTypes.INTEGER, defaultValue: 2 },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const TeacherGroups = sequelize.define("teacher_groups", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  teacher_id: {
    type: DataTypes.STRING,
  },
  group_id: {
    type: DataTypes.STRING,
  },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const Messages = sequelize.define("messages", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  student_id: {
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.STRING
  },
  group_id: {
    type: DataTypes.STRING,
  },
  message: {
    type: DataTypes.STRING,
  },
  time: {
    type: DataTypes.STRING,
  },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const Monthly = sequelize.define("monthlies", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  teacher_id: {
    type: DataTypes.STRING,
  },
  payment: { type: DataTypes.INTEGER },
  month: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const StudentPending = sequelize.define('studentPending', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  firstname: { type: DataTypes.STRING },
  gender: { type: DataTypes.STRING },
  birthday: { type: DataTypes.STRING },
  lastname: { type: DataTypes.STRING },
  fathername: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
  fatherPhone: { type: DataTypes.STRING },
  group_id: { type: DataTypes.STRING },
  motherPhone: { type: DataTypes.STRING },
  where_user: { type: DataTypes.STRING },
  class: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const PendingGroups = sequelize.define("pendingGroups", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING },
  students: { type: DataTypes.JSON },
  count_students: { type: DataTypes.STRING, defaultValue: "0" },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const DTMColumns = sequelize.define("dtmcolumns", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING },
  items: { type: DataTypes.JSON },
  order: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const Blacklist = sequelize.define('blacklists', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING },
  marks: { type: DataTypes.INTEGER },
  student_id: { type: DataTypes.JSON },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const SmsToken = sequelize.define('SmsToken', {
  token: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  expirationDate: {
    field: 'expiration_date',
    type: DataTypes.DATE,
    allowNull: true,
  },
});
const Rooms = sequelize.define('rooms', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  count_students: { type: DataTypes.INTEGER, defaultValue: 0 },
  name: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const LessonGroup = sequelize.define('lesson_group', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  group_id: { type: DataTypes.STRING },
  lesson_time: { type: DataTypes.STRING },
  lesson_day: { type: DataTypes.STRING },
  teacher_id: { type: DataTypes.STRING },
  room_id: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const Exams = sequelize.define('exams', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING },
  date: { type: DataTypes.STRING },
  summa_self: { type: DataTypes.INTEGER },
  summa_other: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const StudentOther = sequelize.define("student_others", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  firstname: { type: DataTypes.STRING },
  lastname: { type: DataTypes.STRING },
  fathername: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  class: { type: DataTypes.STRING },
  science: { type: DataTypes.JSON },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },

});
const ExamStudents = sequelize.define("exam_students", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  student_id: { type: DataTypes.STRING },
  student_other_id: { type: DataTypes.STRING },
  exam_id: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const ExamStudentPoint = sequelize.define("exam_student_points", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  exam_student_id: { type: DataTypes.STRING },
  exam_id: { type: DataTypes.STRING },
  block_1: { type: DataTypes.STRING },
  block_2: { type: DataTypes.STRING },
  block_3: { type: DataTypes.STRING },
  block_4: { type: DataTypes.STRING },
  block_5: { type: DataTypes.STRING },
  student_exam_id: { type: DataTypes.INTEGER, },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const GroupSchedule = sequelize.define('group_schedule', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  group_id: { type: DataTypes.STRING },
  lesson_time: { type: DataTypes.STRING },
  day_of_week: { type: DataTypes.INTEGER },
  teacher_id: { type: DataTypes.STRING },
  room_id: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const Attendansi = sequelize.define('attendansis', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  group_id: { type: DataTypes.STRING },
  date: { type: DataTypes.STRING },
  in_attendansi: { type: DataTypes.BOOLEAN },
  in_attendansi_send_message: { type: DataTypes.BOOLEAN, defaultValue: true },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const AttendansiStudent = sequelize.define('attendansi_students', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  attendan_id: { type: DataTypes.STRING },
  attendan_student_status: { type: DataTypes.STRING },
  student_id: { type: DataTypes.STRING },
  group_id: { type: DataTypes.STRING },
  date: { type: DataTypes.STRING },
  comment: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const FreezeStudents = sequelize.define('freeze_students', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  student_id: { type: DataTypes.STRING },
  group_id: { type: DataTypes.STRING },
  start_date: { type: DataTypes.STRING },
  start_time: { type: DataTypes.STRING },
  group_student_id: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  end_date: { type: DataTypes.STRING },
  end_time: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const DndColumns = sequelize.define("dnd_columns", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING },
  items: { type: DataTypes.TEXT },
  order: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const EmployeeNotes = sequelize.define("employee_notes", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  teacher_id: { type: DataTypes.STRING },
  color: { type: DataTypes.STRING },
  note: { type: DataTypes.TEXT, defaultValue: '' },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const Logs = sequelize.define("logs", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  user_id: { type: DataTypes.STRING },
  text: { type: DataTypes.TEXT, defaultValue: '' },
  order: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});
const TeacherStatistics = sequelize.define('teacher_statistics', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  group_id: { type: DataTypes.STRING },
  student_id: { type: DataTypes.TEXT },
  student_status: { type: DataTypes.STRING },
  teacher_id: { type: DataTypes.STRING },
  student_count: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
});

module.exports = {
  User,
  Students,
  Groups,
  Attendansi,
  Teachers,
  Sciences,
  Payments,
  Debtors,
  GroupStudents,
  TeacherGroups,
  Messages,
  Monthly,
  PendingGroups,
  StudentPending,
  DTMColumns,
  Blacklist,
  SmsToken,
  Rooms,
  LessonGroup,
  GroupSchedule,
  Exams,
  StudentOther,
  ExamStudents,
  ExamStudentPoint,
  AttendansiStudent,
  FreezeStudents,
  DndColumns,
  FreezeUsers,
  PaymentTypes,
  EmployeeNotes,
  Logs,
  TeacherStatistics
};