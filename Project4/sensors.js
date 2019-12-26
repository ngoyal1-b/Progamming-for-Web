'use strict';

const assert = require('assert');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const querystring = require('querystring');

const Mustache = require('./mustache');
const widgetView = require('./widget-view');

const STATIC_DIR = 'statics';
const TEMPLATES_DIR = 'templates';


function serve(port, model, base='') {
 //@TODO
 const app = express();
 app.locals.port = port;
 app.locals.base = base;
 app.locals.model = model;
 app.use(base,express.static(STATIC_DIR));
 Mustache();
 setupRoutes(app);
 app.listen(port,function () {
 console.log(`listening on port ${port}`);

 });
}

module.exports = serve;


const SENSOR_TYPE_INFO = {
 id: {
 name: 'id',
 label: 'SENSOR TYPE ID',
 isRequired: true,
 classes:'tst-sensor-type-id',
 regex: /^[a-zA-Z0-9\-\_ ]+$/,
 error: 'Sensor type Id field can only contain alphanumerics, '-' or _',
 },
 manufacturer: {
 name: 'manufacturer',
 label: 'MANUFACTURER',
 classes:'tst-manufacturer',
 regex: /^[a-zA-Z\-\' ]+$/,
 error: "Manufacturer field can only contain alphabetics, -, ' or space",
 },
 modelNumber: {
 name: 'modelNumber',
 label: 'MODEL NUMBER',
 classes:'tst-model-number',
 regex: /^[a-zA-Z0-9\-\' ]+$/,
 error: "Model Number field can only contain alphanumerics, -, ' or space",
 },
 quantity: {
 name : 'quantity',
 label : 'QUANTITY',
 classes:'tst-quantity',
 type: 'select',
 choices:{
 value1:'temperature',
 value2:'pressure',
 value3:'flow',
 value4:'humidity',

 },
 regex: /^[^@]+\@[^\.]+(\.[^\.]+)+$/,
 error: 'quantity should be selected',
 },
 minimumLimit: {
 name: 'minimumlimit',
 label: 'MINIMUMLIMIT',
 classes:'tst-limits-min',
 type: 'interval',
 regex: /^[0-9]+$/,
 error: 'Limit should be number',
 },
 maximumLimit: {
 name: 'maximumlimit',
 label: 'MAXIMUMLIMIT',
 classes:'tst-limits-max',
 type: 'interval',
 regex: /^[0-9]+$/,
 error: 'Limit should be number',
 },
};


const SENSORS = {
 id: {
 name: 'id',
 label: 'SENSOR ID',
 isRequired: true,
 classes:'tst-sensor-id',
 regex: /^[a-zA-Z0-9\-\_ ]+$/,
 error: 'Sensor Id field can only contain alphanumerics, '-' or _',
 },
 model: {
 name: 'model',
 label: 'MODEL',
 classes:'tst-model',
 //isRequired: true,
 regex: /^[a-zA-Z0-9\-\' ]+$/,
 error: "Manufacturer field can only contain alphanumerics, -, ' or space",
 },
 period: {
 name: 'period',
 label: 'PERIOD',
 classes:'tst-period',
 regex: /^[0-9]+$/,
 error: "Period field can only be integer",
 },
 expectedminimum: {
 name: 'expectedminimum',
 label: 'EXPECTED MINIMUM',
 classes:'tst-expected-min',
 type: 'interval',
 regex: /^[0-9]+$/,
 error: 'Limit should be number',
 },
 expectedmaximum: {
 name: 'expectedmaximum',
 label: 'EXPECTED MAXIMUM',
 classes:'tst-expected-max',
 type: 'interval',
 regex: /^[0-9]+$/,
 error: 'Limit should be number',
 },
};


const SENSOR_TYPE = Object.keys(SENSOR_TYPE_INFO).map((n) => Object.assign({name: n}, SENSOR_TYPE_INFO[n]));


const SENSOR = Object.keys(SENSORS).map((n) => Object.assign({name: n}, SENSORS[n]));



function setupRoutes(app)
{
 const base = app.locals.base;
 app.get(`${base}/sensor-types.html`,doSensorType(app));
 //app.post(`${base}/sensor-types.html`,bodyParser.urlencoded({extended:true}),searchSensorType(app));
 app.get(`${base}/sensors.html`,doSensor(app));
 app.get(`${base}/sensor-types/add.html`,addSensorType(app));
 app.post(`${base}/sensor-types/add.html`,bodyParser.urlencoded({extended:true}),updateSensorType(app));
app.post(`${base}/sensors/add.html`,bodyParser.urlencoded({extended:true}),updateSensor(app));
 app.get(`${base}/sensors/add.html`,addSensor(app));

}



function doSensorType(app) {

 return async function(req,res)
 {
 const mustache = new Mustache();
let results = {};
try{
results = await app.locals.model.list('sensor-types',req.query);
}
catch(err){
console.error(err);
}
 const model = {fields:SENSOR_TYPE,result:results};
 const html = mustache.render('create',model);
 res.send(html);
 };
};

function doSensor(app) {

 return async function(req,res)
 {
 const mustache = new Mustache();
let results = {};
try{
results = await app.locals.model.list('sensors',req.query);
//console.log(results);
}
catch(err){
console.error(err);
}
 const model = {fields:SENSOR,result:results};
 const html = mustache.render('search',model);
 res.send(html);
 };
};

function addSensorType(app)
{
 return async function(req,res)
 {
 const mustache = new Mustache();
 const model = {fields:SENSOR_TYPE};
 const html = mustache.render('addtype',model);
 res.send(html);
 }
}

/*function searchSensorType(app){
 return async function(req,res) {
 const mustache = new Mustache();
 const user = getNonEmptyValues(req.body);
 //console.log(user);
 console.log(req.body);
 //let errors = validate(user, ['SensorTypeId']);
 let result = {};
 try {
 result = await app.locals.model.update('sensor-types', req.body);
console.log(req.body);
 console.log(result);
 } catch (err) {
 console.error(err);
 }
 const model = {fields:SENSOR_TYPE,result:result};
 const html = mustache.render('create',model);
 res.send(html);}

}*/

function updateSensorType(app){
 return async function(req,res) {
 const mustache = new Mustache();
 const user = getNonEmptyValues(req.body);
 let errors = validate(user, ['id']);
const min=1;
const max=100;
user.limits={min,max};
user.unit="%";
let result={};
 try {
 result = await app.locals.model.update('sensor-types', user);
 res.redirect(`${app.locals.base}/sensor-types.html`);
 } catch (err) {
 //console.error(err);
 errors = wsErrors(err);
 }

 const model = {fields:SENSOR_TYPE,result:result};
 const html = mustache.render('create',model);
 res.send(html);}

}

function updateSensor(app){
 return async function(req,res) {
 const mustache = new Mustache();
 const user = getNonEmptyValues1(req.body);
 //let errors = validate(user, ['id']);
const min=1;
const max=100;
user.expected={min,max};
let result={};
 try {
 result = await app.locals.model.update('sensors', user);
 res.redirect(`${app.locals.base}/sensors.html`);
 } catch (err) {
 //console.error(err);
 //errors = wsErrors(err);
 }

 const model = {fields:SENSOR,result:result};
 const html = mustache.render('search',model);
 res.send(html);}

}




function addSensor(app)
{
 return async function(req,res)
 {
 const mustache = new Mustache();
 const model = {fields:SENSOR};
 const html = mustache.render('addsensor',model);
 res.send(html);
 }
}


function fieldsWithValues(values, errors={}) {
 return SENSOR_TYPE.map(function (info) {
 const name = info.name;
 const extraInfo = { value: values[name] };
 if (errors[name]) extraInfo.errorMessage = errors[name];
 return Object.assign(extraInfo, info);
 });
}

function validate(values, requires=[]) {
 const errors = {};
 requires.forEach(function (name) {
 if (values[name] === undefined) {
 errors[name] =
 `A value for '${SENSOR_TYPE_INFO[name].name}' must be provided`;
 }
 });
 for (const name of Object.keys(values)) {
 const fieldInfo = SENSOR_TYPE_INFO[name];
 const value = values[name];
 if (fieldInfo.regex && !value.match(fieldInfo.regex)) {
 errors[name] = fieldInfo.error;
 }
 }
 return Object.keys(errors).length > 0 && errors;
}

function getNonEmptyValues(values) {
 const out = {};
 Object.keys(values).forEach(function(k) {
 if (SENSOR_TYPE_INFO[k] !== undefined) {
 const v = values[k];
 if (v && v.trim().length > 0) out[k] = v.trim();
 }
 });
 return out;
}
function getNonEmptyValues1(values) {
 const out = {};
 Object.keys(values).forEach(function(k) {
 if (SENSORS[k] !== undefined) {
 const v = values[k];
 if (v && v.trim().length > 0) out[k] = v.trim();
 }
 });
 return out;
}

/*function errorModel(app, values={}, errors={},result) {
 return {
 base: app.locals.base,
 errors: errors._,
 fields: fieldsWithValues(values, errors),
 result:result
 };
}*/

function wsErrors(err) {
 const msg = (err.message) ? err.message : 'web service error';
 console.error(msg);
 return { _: [ msg ] };
}


function isNonEmpty(v) {
 return (v !== undefined) && v.trim().length > 0;
}

