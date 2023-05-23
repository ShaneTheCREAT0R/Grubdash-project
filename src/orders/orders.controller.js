const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function bodyDataHas(propertyName) {
    return function(req, res, next) {
        const { data = {} } = req.body;
        if (data[propertyName]) {
            return next()
        }
        next({ status: 400, message: `Order must include a ${propertyName}`})
    }
}

function dishQuantityIsValid(req, res, next) {
    const { data: {dishes: [{quantity = {} }] }} = req.body;
    
    if (quantity <=0 || !Number.isInteger(quantity)){
        return next({
            status: 400,
            message: `Dish ${index} must have a quantity that is an integer greater than 0`
        })
    }
    next();
}

function dishesExist(req, res, next) {
    const { data: {dishes = {} }} = req.body;
    if (dishes === [] || !Array.isArray(dishes)) {
     return next({
        status: 400,
         message: `Order must include at least one dish`,
     });
    }
    next();
};

function hasBeenDelivered(req, res, next){
    const { data: {status ={} }} = req.body;
    if (status === "delivered"){
        return next({
            status: 400,
            message: "A delivered order cannot be changed",
        })
    }
    next();
}

//create
function create(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes: {name, description, image_url, price, quantity} } = {} } = req.body
    const newOrder = {
        deliverTo,
        mobileNumber,
        status,
        dishes : [{
            id: nextId(),
            name,
            description,
            image_url,
            price,
            quantity,
        }]
    }
    orders.push(newOrder);
    res.status(201).json({ data: newOrder});
}

//read
function list(req, res, next){
    res.status(200).json({ data: orders });
}

//list
function read(req, res){
    res.status(200).json({ data: res.locals.order });
}

//update
function update(req, res) {
    const order = res.locals.order;
    const  { data: { deliverTo, mobileNumber, status, dishes: [{name, description, image_url, price, quantity}] } = {} } = req.body;

    //update the order
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes.name = name;
    order.dishes.description = description;
    order.dishes.image_url = image_url;
    order.dishes.price = price;
    order.dishes.quantity = quantity;

    res.json({ data: order })
}


module.exports = {
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        dishesExist,
        dishQuantityIsValid,
        create,
    ],
    update: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        dishesExist,
        dishQuantityIsValid,
        hasBeenDelivered,
        update,
    ],
    read,
    list,
}