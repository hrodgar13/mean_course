const moment = require('moment')
const Order = require('../models/Order')
const errorHandler = require('../utils/errorHandler')

module.exports.overview = async function (req, res) {
    try {
        const allOrders = await Order.find({user: req.user.id}).sort({date: 1})
        const ordersMap = getOrdersMap(allOrders)
        const yesterdayOrders = ordersMap[moment().add(-1, 'd').format('DD.MM.YYYY')] || []

        // orders amount yesterday
        const yesterdayOrdersNumber = yesterdayOrders.length;

        // Orders amount
        const ordersAmount = allOrders.length;

        // Days amount
        const daysAmount = Object.keys(ordersMap).length;

        // Orders in day
        const ordersPerDay = (ordersAmount / daysAmount).toFixed(0);

        // Percent for orders amount
        // ((orders yesterday \ amount orders in day) - 1) * 100
        const ordersPercent = (((yesterdayOrdersNumber /  ordersPerDay) - 1) * 100).toFixed(2)

        // All Stonks
        const totalGain = calculatePrice(allOrders);

        // Stonks per day
        const gainPerDay = totalGain / daysAmount

        // Stonks yesterday
        const yesterdayGain = calculatePrice(yesterdayOrders)

        // Stonks Percent
        const gainPercent = (((yesterdayGain /  gainPerDay) - 1) * 100).toFixed(2)

        // Compare Stonks
        const compareGain = (yesterdayGain - gainPerDay).toFixed(2)

        // Compare Order
        const compareAmount = (yesterdayOrdersNumber - ordersPerDay).toFixed(2)

        res.status(200).json({
            stonks: {
                percent: Math.abs(+gainPercent),
                compare:  Math.abs(+compareGain),
                yesterday: +yesterdayGain,
                isHigher: +gainPercent > 0,
            },
            orders: {
                percent: Math.abs(+ordersPercent),
                compare:  Math.abs(+compareAmount),
                yesterday: +yesterdayOrdersNumber,
                isHigher: +ordersPercent > 0,
            }
        })

    } catch (e) {
        errorHandler(e, res)
    }
}

module.exports.analytics = async function (req, res) {
    try {
        const allOrders = await Order.find({user: req.user.id}).sort({date: 1})
        const ordersMap = getOrdersMap(allOrders)

        const average = +(calculatePrice(allOrders)/ Object.keys(ordersMap).length).toFixed(2)

        const chart = Object.keys(ordersMap).map(label => {
            // label == 05.05.2018

            const stonk = calculatePrice(ordersMap[label])
            const order = ordersMap[label].length

            return {
                label, order, stonk
            }
        })

        res.status(200).json({ average, chart })

    } catch (e) {
        errorHandler(e, res)
    }
}

function getOrdersMap(orders = []) {
    let daysOrder = {}
    orders.forEach(order => {
        const date = moment(order.date).format('DD.MM.YYYY')

        if (date === moment().format('DD.MM.YYYY')) {
            return
        }

        if (!daysOrder[date]) {
            daysOrder[date] = []
        }

        daysOrder[date].push(order)
    })


    return daysOrder
}

function calculatePrice(orders = []) {
    return orders.reduce((total, order)=> {
        const orderPrice = order.list.reduce((orderTotal,item) => {
            return orderTotal += item.cost * item.quantity
        }, 0)
        return total += orderPrice
    }, 0)
}