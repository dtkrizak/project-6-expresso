const  express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    db.get(`SELECT * FROM MenuItem WHERE id=${menuItemId}`, (err, row) => {
        if(err) {
            next(err);
        } else if(row){
            req.menuItem = row;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

menuItemsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM MenuItem WHERE menu_id=${req.params.menuId}`, (err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({menuItems: rows});
        }
    });
});

menuItemsRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    
    if(!name || !inventory || !price){
        return res.sendStatus(400);
    }

    const sqlPost = `INSERT INTO MenuItem(
        name, description, inventory, price, menu_id) VALUES (
        $name, $description, $inventory, $price, $menu_id
    )`;
    const sqlVal = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menu_id: req.params.menuId
    };

    db.run(sqlPost, sqlVal, function(err) {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE id=${this.lastID}`, (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(201).json({menuItem: row});
                }
            })
        }
    })
});

menuItemsRouter.get('/:menuItemId', (req, res, next) => {
    res.status(200).json({menuItem: req.menuItem});
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;

    if (!name || !inventory || !price) {
        return res.sendStatus(400);
    }

    const sqlPut = `UPDATE MenuItem
        SET name = $name, description = $description, 
        inventory = $inventory, price = $price, menu_id = $menu_id
        WHERE id = $id`;
    const sqlVal = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menu_id: req.params.menuId,
        $id: req.params.menuItemId
    };

    db.run(sqlPut, sqlVal, function (err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE id=${req.params.menuItemId}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({ menuItem: row });
                }
            })
        }
    })
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    db.run(`DELETE FROM MenuItem WHERE id=${req.params.menuItemId}`, (err) => {
        if(err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    });
});

module.exports = menuItemsRouter;