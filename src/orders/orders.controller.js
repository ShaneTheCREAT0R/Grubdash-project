const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass


function orderExists(req, res, next){
    const orderId = req.params.orderId;
    res.locals.orderId = orderId;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        res.locals.orderId = orderId;
        return next()
    }
    next({
        status: 404,
        message: `Order not found: ${orderId}` 
    });
}

function bodyDataHas(propertyName) {
    return function(req, res, next) {
        const { data = {} } = req.body;
        if (data[propertyName]) {
            res.locals.reqBody = data;
            return next()
        }
        next({ status: 400, message: `Order must include a ${propertyName}`})
    }
}



function dishesExist(req, res, next) {
    const { data: {dishes = {} }} = req.body;
    if (dishes.length === 0 || !Array.isArray(dishes)) {
     return next({
         status: 400,
         message: `Order must include at least one dish`,
     });
    }
    next();
};



function dishQuantityIsValid(req, res, next) {
    const { data: {dishes = {} }} = req.body;
    dishes.forEach((dish) => {
       const dishQuantity = dish.quantity;
       if (!dishQuantity || typeof dishQuantity != "number" || dishQuantity <= 0) {
          return next({
          status: 400,
          message: `Dish ${dishes.indexOf(
             dish
          )} must have a quantity that is an integer greater than 0`,
          });
       }
    });
    next();
}

const incomingStatusIsValid = (req, res, next) => {
    const { data: { status = {} }} = req.body;
    if (!status || status.length === 0 || status === "invalid") {
       return next({
          status: 400,
          message:
          "Order must have a status of pending, preparing, out-for-delivery, delivered",
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

function orderIdMatches(req, res, next){
    const orderId = res.locals.orderId;
    const reqBody = res.locals.reqBody;
    if (reqBody.id) {
        if (reqBody.id === orderId) {
          return next();
        }
        next({
          status: 400,
          message: `Order id does not match route id. Order: ${reqBody.id}, Route: ${orderId}`,
        });
      }
    next();
}

function statusPending(req, res, next){
    const {status = {} } = res.locals.order;
    if (status !== "pending"){
        return next({
            status: 400,
            message: "An order cannot be deleted unless it is pending."
        })
    }
    next();
}

//create
function create(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes: {name, description, image_url, price, quantity} } = {} } = req.body
    const newOrder = {
        id: nextId(),
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
    const  { data: { deliverTo, mobileNumber, status, dishes: {name, description, image_url, price, quantity} } = {} } = req.body;

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

//destroy
function destroy(req, res){
    const index = orders.indexOf(res.locals.order);
    orders.splice(index, 1);
    res.sendStatus(204);
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
        orderExists,
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        bodyDataHas("status"),
        dishesExist,
        dishQuantityIsValid,
        orderIdMatches,
        incomingStatusIsValid,
        hasBeenDelivered,
        update,
    ],
    read: [
        orderExists,
        read,
    ],
    list,
    destroy: [
        orderExists,
        statusPending,
        destroy,
    ],
}