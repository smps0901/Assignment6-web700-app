const Sequelize = require('sequelize');
var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', '43pbYfhjCSgk', {
    host: 'ep-ancient-frost-a5r5z8a4.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Define the Student model
const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING
});

// Define the Course model
const Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

module.exports.getCourses = function () {
    return new Promise((resolve, reject) => {
        Course.findAll()
            .then(data => resolve(data))
            .catch(err => reject("no results returned"));
    });
};


// Define the relationship between Course and Student
Course.hasMany(Student, { foreignKey: 'course' });

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        sequelize.sync()
            .then(() => resolve())
            .catch(() => reject("unable to sync the database"));
    });
};

module.exports.getAllStudents = function () {
    return new Promise(function (resolve, reject) {
        Student.findAll()
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
};

module.exports.getStudentsByCourse = function (course) {
    return new Promise(function (resolve, reject) {
        Student.findAll({
            where: { course: course }
        })
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
};

module.exports.getStudentByNum = function (num) {
    return new Promise(function (resolve, reject) {
        Student.findAll({
            where: { studentNum: num }
        })
            .then(data => resolve(data[0]))
            .catch(() => reject("no results returned"));
    });
};

// module.exports.getCourses = function () {
//     return new Promise(function (resolve, reject) {
//         Course.findAll()
//             .then(data => resolve(data))
//             .catch(() => reject("no results returned"));
//     });
// };

module.exports.getCourseById = function (id) {
    return new Promise(function (resolve, reject) {
        Course.findAll({
            where: { courseId: id }
        })
            .then(data => resolve(data[0]))
            .catch(() => reject("no results returned"));
    });
};

module.exports.addStudent = function (studentData) {
    studentData.TA = (studentData.TA) ? true : false;
    for (let prop in studentData) {
        if (studentData[prop] === "") studentData[prop] = null;
    }

    return new Promise(function (resolve, reject) {
        Student.create(studentData)
            .then(() => resolve())
            .catch(() => reject("unable to create student"));
    });
};

module.exports.updateStudent = function (studentData) {
    studentData.TA = (studentData.TA) ? true : false;
    for (let prop in studentData) {
        if (studentData[prop] === "") studentData[prop] = null;
    }

    return new Promise(function (resolve, reject) {
        Student.update(studentData, {
            where: { studentNum: studentData.studentNum }
        })
            .then(() => resolve())
            .catch(() => reject("unable to update student"));
    });
};

module.exports.addCourse = function (courseData) {
    for (let prop in courseData) {
        if (courseData[prop] === "") courseData[prop] = null;
    }

    return new Promise(function (resolve, reject) {
        Course.create(courseData)
            .then(() => resolve())
            .catch(() => reject("unable to create course"));
    });
};

module.exports.updateCourse = function (courseData) {
    for (let prop in courseData) {
        if (courseData[prop] === "") courseData[prop] = null;
    }

    return new Promise(function (resolve, reject) {
        Course.update(courseData, {
            where: { courseId: courseData.courseId }
        })
            .then(() => resolve())
            .catch(() => reject("unable to update course"));
    });
};

module.exports.deleteCourseById = function (id) {
    return new Promise(function (resolve, reject) {
        Course.destroy({
            where: { courseId: id }
        })
            .then(() => resolve())
            .catch(() => reject("unable to delete course"));
    });
};

module.exports.deleteStudentByNum = function (studentNum) {
    return new Promise(function (resolve, reject) {
        Student.destroy({
            where: { studentNum: studentNum }
        })
            .then(() => resolve())
            .catch(() => reject("unable to delete student"));
    });
};

