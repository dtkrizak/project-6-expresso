const express = require('express');
const employeesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const  timesheetsRouter = require('./timesheets');

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
    db.get(`SELECT * FROM Employee WHERE id=${employeeId}`, (err, row) => {
        if(err) {
            next(err);
        } else if(row) {
            req.employee = row;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

employeesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Employee WHERE is_current_employee=1`, (err, rows) => {
        if(err){
            next(err);
        } else {
            res.status(200).json({employees: rows});
        }
    });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({employee: req.employee});
});

employeesRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    
    const sqlPost = `INSERT INTO Employee (
        name, position, wage, is_current_employee) VALUES (
        $name, $position, $wage, $is_current_employee)`;
    const sqlVal = {
        $name: name, 
        $position: position, 
        $wage: wage, 
        $is_current_employee: isCurrentEmployee
    };

    if(!name || !position || !wage){
        return res.sendStatus(400);
    }

    db.run(sqlPost, sqlVal, function (err) {
        if(err){
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id=${this.lastID}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({employee: row});
                }
            });
        }
    });
});

employeesRouter.put('/:employeeId', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;

    const sqlPut = `UPDATE Employee
        SET name = $name, position = $position, wage = $wage,
        is_current_employee = $is_current_employee
        WHERE id = $id`;
    const sqlVal = {
        $name: name,
        $position: position,
        $wage: wage,
        $is_current_employee: isCurrentEmployee,
        $id: req.params.employeeId
    };

    if (!name || !position || !wage) {
        return res.sendStatus(400);
    }

    db.run(sqlPut, sqlVal, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id=${req.params.employeeId}`, (err, row) => {
                if(err){
                    next(err);
                } else {
                    res.status(200).json({employee: row});
                }
            });
        }
    });
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
    const sqlDel = `UPDATE Employee SET is_current_employee=0 WHERE id=${req.params.employeeId}`;
    db.run(sqlDel, (err) => {
        if(err){
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, row) => {
                res.status(200).json({ employee: row });
            });
        }
    })
});

module.exports = employeesRouter;