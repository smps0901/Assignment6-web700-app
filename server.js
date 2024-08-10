/********************************************************************************
*   WEB700 – Assignment 06 
*  
*	I declare that this assignment is my own work in accordance with Seneca's Academic Integrity Policy: 
*  
*	https://www.senecacollege.ca/about/policies/academic-integrity-policy.html 
*  
*	Name: Su Myat Pwint Soe Student ID: 160255238 Date: 8/10/2024 
* 
*	Published URL GitHub: 
*
*   Published URL Vercel: 
* 
********************************************************************************/

var HTTP_PORT = process.env.PORT || 8080;
const express = require('express');
const app = express();
const path = require('path');
const collegeData = require("./modules/collegeData");
const exphbs = require('express-handlebars');

// Set up Handlebars view engine
const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// Middleware to set activeRoute
app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

// Middleware for static files and URL encoding
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// Routes

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/htmlDemo', (req, res) => {
    res.render('htmlDemo');
});

// 2024.8.8
// app.get('/students/add', (req, res) => {
//     res.render('addStudent');
// });

app.get('/students', (req, res) => {
    if (req.query.course) {
        collegeData.getStudentsByCourse(req.query.course).then(data => {
            if (data.length > 0) {
                res.render('students', { students: data });
            } else {
                res.render('students', { message: "no results" });
            }
        }).catch(err => {
            res.render('students', { message: "no results" });
        });
    } else {
        collegeData.getAllStudents().then(data => {
            if (data.length > 0) {
                res.render('students', { students: data });
            } else {
                res.render('students', { message: "no results" });
            }
        }).catch(err => {
            res.render('students', { message: "no results" });
        });
    }
});

app.get('/courses', (req, res) => {
    collegeData.getCourses().then(data => {
        if (data.length > 0) {
            res.render('courses', { courses: data });
        } else {
            res.render('courses', { message: "no results" });
        }
    }).catch(err => {
        res.render('courses', { message: "no results" });
    });
});

app.get('/course/:id', (req, res) => {
    collegeData.getCourseById(req.params.id).then(data => {
        if (data) {
            res.render('course', { course: data });
        } else {
            res.status(404).send("Course Not Found");
        }
    }).catch(err => {
        res.status(404).send("Course Not Found");
    });
});

// app.get("/student/:studentNum", (req, res) => {
//     collegeData.getStudentByNum(req.params.studentNum).then((data) => {
//         if (data) {
//             res.render('student', { student: data });
//         } else {
//             res.status(404).send("student Not Found");
//         }
//     }).catch(err => {
//         res.status(404).send("student Not Found");
//     });
// });

//8.8.24 To fix student update form
// app.get("/student/:studentNum", (req, res) => {
//     let viewData = {};

//     collegeData.getStudentByNum(req.params.studentNum).then((data) => {
//         if (data) {
//             viewData.student = data;
//         } else {
//             viewData.student = null;
//         }
//     }).catch((err) => {
//         viewData.student = null;
//     }).then(collegeData.getCourses).then((data) => {
//         viewData.courses = data;

//         for (let i = 0; i < viewData.courses.length; i++) {
//             if (viewData.courses[i].courseId == viewData.student.course) {
//                 viewData.courses[i].selected = true;
//             }
//         }
//     }).catch((err) => {
//         viewData.courses = [];
//     }).then(() => {
//         if (viewData.student == null) {
//             res.status(404).send("Student Not Found");
//         } else {
//             res.render("student", { viewData: viewData });
//         }
//     });
// }); 

app.get('/student/:studentNum', (req, res) => {
    let viewData = {};

    collegeData.getStudentByNum(req.params.studentNum)
        .then((data) => {
            if (data) {
                viewData.student = data; // store student data in the "viewData" object as "student"
            } else {
                viewData.student = null; // if no student found, set student to null
            }
        })
        .catch(() => {
            viewData.student = null; // if there was an error, set student to null
        })
        .then(collegeData.getCourses)
        .then((data) => {
            viewData.courses = data; // store course data in the "viewData" object as "courses"

            // loop through viewData.courses and once we have found the courseId that matches
            // the student's "course" value, add a "selected" property to the matching viewData.courses object
            for (let i = 0; i < viewData.courses.length; i++) {
                if (viewData.courses[i].courseId == viewData.student.course) {
                    viewData.courses[i].selected = true;
                }
            }
        })
        .catch(() => {
            viewData.courses = []; // if there was an error, set courses to empty
        })
        .then(() => {
            if (viewData.student == null) { // if no student - return an error
                res.status(404).send("Student Not Found");
            } else {
                res.render("student", { viewData: viewData }); // render the "student" view
            }
        });
});


app.get('/students/add', (req, res) => {
    collegeData.getCourses().then((data) => {
        console.log("Courses fetched:", data); // Log fetched courses
        res.render('addStudent', { courses: data });
    }).catch((err) => {
        console.error("Error fetching courses:", err); // Log error
        res.render('addStudent', { courses: [] });
    });
});



app.post('/students/add', (req, res) => {
    collegeData.addStudent(req.body).then(() => {
        res.redirect('/students');
    }).catch(err => {
        res.status(500).send('Unable to add student');
    });
});

app.post('/student/update', (req, res) => {
    collegeData.updateStudent(req.body).then(() => {
        res.redirect('/students');
    }).catch(err => {
        res.status(500).send('Unable to update student');
    });
});




app.get('/courses/add', (req, res) => {
    res.render('addCourse');
});

app.post('/courses/add', (req, res) => {
    collegeData.addCourse(req.body).then(() => {
        res.redirect('/courses');
    }).catch(err => {
        res.status(500).send('Unable to add course');
    });
});

app.post('/course/update', (req, res) => {
    collegeData.updateCourse(req.body).then(() => {
        res.redirect('/courses');
    }).catch(err => {
        res.status(500).send('Unable to update course');
    });
});

app.get('/course/delete/:id', (req, res) => {
    collegeData.deleteCourseById(req.params.id).then(() => {
        res.redirect('/courses');
    }).catch(err => {
        res.status(500).send('Unable to Remove Course / Course not found');
    });
});

app.get('/student/delete/:studentNum', (req, res) => {
    collegeData.deleteStudentByNum(req.params.studentNum).then(() => {
        res.redirect('/students');
    }).catch((err) => {
        res.status(500).send("Unable to remove student / student not found");
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Initialize and start the server
collegeData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log("server listening on port: " + HTTP_PORT);
    });
}).catch(err => {
    console.log("Unable to start server: " + err);
});



