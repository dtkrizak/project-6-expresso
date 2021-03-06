const express = require('express');
const menuRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuItemsRouter = require('./menuItems');

menuRouter.use('/:menuId/menu-items', menuItemsRouter);

menuRouter.param('menuId', (req, res, next, menuId) => {
    db.get(`SELECT * FROM Menu WHERE id=${menuId}`, (err, row) => {
        if(err) {
            next(err);
        } else if(row) {
            req.menu = row;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

menuRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Menu`, (err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({menus: rows});
        }
    });
});

menuRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menu});
});

menuRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;

    if(!title) {
        return res.sendStatus(400);
    }

    const sqlPost = `INSERT INTO Menu (
        title) VALUES (
        $title)`;
    const sqlVal = {
        $title: title
    };

    db.run(sqlPost, sqlVal, function (err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE id=${this.lastID}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({ menu: row });
                }
            });
        }
    });
});

menuRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;

    if (!title) {
        return res.sendStatus(400);
    }

    const sqlPut = `UPDATE Menu 
        SET title = $title 
        WHERE id = $id`;
    const sqlVal = {
        $title: title,
        $id: req.params.menuId
    };

    db.run(sqlPut, sqlVal, function (err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE id=${req.params.menuId}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({menu: row});
                }
            });
        }
    });
});

menuRouter.delete('/:menuId', (req, res, next) => {
    db.get(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`, (err, row) => {
        if(err) {
            next(err);
        } else if(row) {
            //Send response of items in menu
            res.sendStatus(400);
        } else {
            //Delete from table if no items
            db.run(`DELETE FROM Menu WHERE id = ${req.params.menuId}`, (err) => {
                if(err){
                    next(err);
                } else {
                    res.sendStatus(204);
                }
            });
        }
    });
});

module.exports = menuRouter;