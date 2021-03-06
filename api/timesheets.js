const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
    db.get(`SELECT * FROM Timesheet WHERE id=${timesheetId}`, (err, row) => {
        if(err) {
            next(err);
        } else if(row) {
            req.timesheet = row;
            next();
        } else {
            res.sendStatus(404);
        }
    })
});

timesheetsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Timesheet WHERE employee_id=${req.params.employeeId}`, (err, rows) => {
        if(err){
            next(err);
        } else {
            res.status(200).json({timesheets: rows});
        }
    });
});

timesheetsRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;

    const sqlPost = `INSERT INTO Timesheet (
        hours, rate, date, employee_id) VALUES (
        $hours, $rate, $date, $employee_id)`;
    const sqlVal = {
        $hours: hours, 
        $rate: rate, 
        $date: date, 
        $employee_id: req.params.employeeId
    };

    if (!hours || !rate || !date) {
        return res.sendStatus(400);
    }

    db.run(sqlPost, sqlVal, function (err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE id=${this.lastID}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({ timesheet: row });
                }
            });
        }
    });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;

    const sqlPut = `UPDATE Timesheet 
        SET hours = $hours, rate = $rate, date = $date, 
        employee_id = $employee_id
        WHERE id = $id`;
    const sqlVal = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employee_id: req.params.employeeId,
        $id: req.params.timesheetId
    };

    if (!hours || !rate || !date) {
        return res.sendStatus(400);
    }

    db.run(sqlPut, sqlVal, function (err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE id=${req.params.timesheetId}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({ timesheet: row });
                }
            });
        }
    }); 
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    db.run(`DELETE FROM Timesheet WHERE id=${req.params.timesheetId}`, (err) => {
        if(err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    });
});


module.exports = timesheetsRouter;