const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass


function bodyDataHas(propertyName) {
    return function (req, res, next) {
        const { data = {} } = req.body;
        if (data[propertyName]) {
            return next();
        }
        next ({ status: 400, message: `Must include a ${propertyName}` });
    };
}


function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => dish.id == Number(dishId));
    if (foundDish) {
      res.locals.dish = foundDish;
      return next();
    }
    next({
      status: 404,
      message: `Dish id not found: ${dishId}`,
    });
  };
  

//create
function create(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    }
    dishes.push(newDish);
    res.status(201).json({ data: newDish })
}

//read
function read(req, res, next) {
    res.json({ data: res.locals.dish })
}

//update
function update(req, res) {
    const dish = res.locals.dish;
    const { data: { name, description, price, image_url } = {} } = req.body;
  
    // Update the dish
    dish.name = name;
    dish.description = description;
    dish.price = price; 
    dish.image_url = image_url;
  
    res.json({ data: dish });
  
  }

//list 
function list(req, res) {
    const { dishId } = req.params;
    res.json({ data: dishes.filter(dishId ? dish => dish.id == dishId : () => true) });
  }


module.exports = {
    create: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        create,
    ],
    read: [dishExists, read],
    list,
    update: [
        dishExists,
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        update,
    ],
}