var async = require('async');
var util = require('util');
var Product = require('../models/product').Product;
var User = require('../models/user').User;

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var paymentSchema = new Schema({
    user: Schema.Types.ObjectId,
    sum:String, // Сумма
    currency: String, // Валюта
    agr_user:String, // Идентификатор пользователя в системе аггрегаторе платежей
    agr_payment_no:String, //Номер платежа в системе аггрегатора
    agr_order_id: String, // Идентификаторв платежа в системе агратора
    adr_descritpion:String, // Описание платежа в системе агрегатора
    agr_create_date: String, // Дата создания платежа в системе агрегатора
    agr_update_date: String, // Дата изменение платежа в системе агрегатора
    agr_order_state: String, // Статус платежа в системе агрегатора
    agr_signature: String,
    status:String,
    created: {
        type: Date,
        default: Date.now
    },
    confirm_date: { type: Date }
});

exports.Payment = mongoose.model('paymentss', paymentSchema);
