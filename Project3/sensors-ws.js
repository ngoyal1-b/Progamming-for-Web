const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

const AppError = require('./app-error');

const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;
const SERVER_ERROR = 500;

function serve(port,sensors) {
 //@TODO set up express app, routing and listen
 const app = express();
 app.locals.port = port;
 app.locals.sensors = sensors;
 setupRoutes(app);
 const server = app.listen(port,function () {
 console.log(`listening on port ${port}`);
 });
 return server;
}

module.exports = { serve };

//@TODO routing function, handlers, utility functions

function setupRoutes(app) {
 //const base = app.locals.sensors;
 app.use(cors());
 app.use(bodyParser.json());
 app.get('/sensor-types',dolist(app));
 app.get('/sensors',dolist1(app));
 app.get('/sensor-types/:id',doGet(app));
 app.get('/sensors/:id',doGet1(app));
 app.get('/sensor-data/:sensorId',doGet2(app));
 app.get('/sensor-data/:sensorId/:timestamp',doGet3(app));
 app.post('/sensor-types',doCreate(app));
 app.post('/sensors',doCreate1(app));
 app.post('/sensor-data/:sensorId',doCreate2(app));
 app.use(doErrors());
}

function dolist(app){
 return errorWrap(async function(req,res){
 let results = {};
 let nurl;
 let purl;
 const q = req.query||{};
 try{
 results = await app.locals.sensors.findSensorTypes(q);
 if(results.nextIndex > 0)
 {
 nurl = baseUrl(requestUrl(req))+'?'+'_index='+results.nextIndex;
 if(q._count>0)
 {
 nurl += '&_count='+q._count;
 }
 }
 if(results.previousIndex > 0)
 {
 purl = baseUrl(requestUrl(req))+'?'+'_index='+results.previousIndex;
 if(q._count>0)
 {
 purl += '&_count='+q._count;
 }
 }
 let data = results.data;
 data.forEach((ele)=>{ele.self = baseUrl(requestUrl(req)) + '/' + ele.id});
 await res.json(
 {
 "self": requestUrl(req),
	results,
 "next":nurl,
 "prev":purl
 }
 );
 }
 catch(err)
 {
 const mapped = mapError(err);
 res.status(mapped.status).json(mapped);
 }
 });
}
function dolist1(app){
 return errorWrap(async function(req,res){
 const q = req.query||{};
 let results = {};
 let nurl;
 let purl;
 try {
 results = await app.locals.sensors.findSensors(q);
 if(results.nextIndex > 0)
 {
 nurl = requestUrl(req)+'&'+'_index='+results.nextIndex;
 }
 if(results.previousIndex > 0)
 {
 purl = requestUrl(req)+'&'+'_index='+results.previousIndex;
 }
 let data = results.data;
 data.forEach((ele)=>{ele.self = baseUrl(requestUrl(req)) + '/' + ele.id});
 await res.json(
 {
 "self": requestUrl(req),
	results,
 "next":nurl,
 "prev":purl,
 }
 );
 }
 catch(err)
 {
 const mapped = mapError(err);
 res.status(mapped.status).json(mapped);
 }
 });
}

function doGet(app) {
 return errorWrap(async function(req, res) {
 let results = {};
 try {
 const id = req.params.id;
 results = await app.locals.sensors.findSensorTypes({ id: id });
 let data = results.data;
 data.forEach((ele)=>{ele.self = baseUrl(requestUrl(req))});
 if (results.length === 0) {
 throw {
 isDomain: true,
 errorCode: 'NOT_FOUND',
 message: `no results for sensor-type id: ${id}`,
 };
 }
 else {
 await res.json(
 {
 "self": requestUrl(req),
 	results,
 }
 );
 }
 }
 catch(err) {
 const mapped = mapError(err);
 res.status(mapped.status).json(mapped);
 }
 });
}

function doGet1(app) {
 return errorWrap(async function(req, res) {
 try {
 const id = req.params.id;
 results = await app.locals.sensors.findSensors({ id: id });
 let data = results.data;
 data.forEach((ele)=>{ele.self = baseUrl(requestUrl(req))});
 if (results.length === 0) {
 throw {
 isDomain: true,
 errorCode: 'NOT_FOUND',
 message: `no result for sensor ${id}`,
 };
 }
 else {
 await res.json(
 {
 "self": requestUrl(req),
	results,
 }
 );
 }
 }
 catch(err) {
 const mapped = mapError(err);
 res.status(mapped.status).json(mapped);
 }
 });
}

function doGet2(app) {
 return errorWrap(async function(req, res) {
 try {
 const id = req.params.sensorId;
 const q = req.query||{};
 q.sensorId = req.params.sensorId;
 const results = await app.locals.sensors.findSensorData(q);
 let data = results.data;
 data.forEach((ele)=>{ele.self = baseUrl(requestUrl(req)) + '/' + ele.timestamp});
 if (results.length === 0) {
 throw {
 isDomain: true,
 errorCode: 'NOT_FOUND',
 message: `user ${id} not found`,
 };
 }
 else {
 await res.json(
 {
 "self": requestUrl(req),
	results,
 }
 );
 }
 }
 catch(err) {
 const mapped = mapError(err);
 res.status(mapped.status).json(mapped);
 }
 });
}


function doGet3(app) {
 return errorWrap(async function(req, res) {
 try {
 const id = req.params.sensorId;
 const q = req.query||{};
 q.sensorId = req.params.sensorId;
 q.timestamp = req.params.timestamp;
 const results = await app.locals.sensors.findSensorData(q);
 let data = results.data;
 data.forEach((ele)=>{ele.self = baseUrl(requestUrl(req))});
 if (results.length === 0) {
 throw {
 isDomain: true,
 errorCode: 'NOT_FOUND',
 message: `user ${id} not found`,
 };
 }
 else {
 await res.json(
 {
 "self": requestUrl(req),
 "data": data[0],
 }
 );
 }
 }
 catch(err) {
 const mapped = mapError(err);
 res.status(mapped.status).json(mapped);
 }
 });
}



function doCreate(app) {
 return errorWrap(async function(req, res) {
 try {
 const obj = req.body;
 const results = await app.locals.sensors.addSensorType(obj);
 res.append('Location', requestUrl(req) + '/' + obj.id);
 res.sendStatus(CREATED);
 }
 catch(err) {
 const mapped = mapError(err);
 res.status(mapped.status).json(mapped);
 }
 });
}

function doCreate1(app) {
 return errorWrap(async function(req, res) {
 try {
 const obj = req.body;
 const results = await app.locals.sensors.addSensor(obj);
 res.append('Location', requestUrl(req) + '/' + obj.model);
 res.sendStatus(CREATED);
 }
 catch(err) {
 const mapped = mapError(err);
 res.status(mapped.status).json(mapped);
 }
 });
}

function doCreate2(app) {
 return errorWrap(async function(req, res) {
 try {
 const obj = req.body;
 obj.sensorId = req.params.sensorId;
 const results = await app.locals.sensors.addSensorData(obj);
 res.append('Location', requestUrl(req) + '/' + obj.sensorId);
 res.sendStatus(CREATED);
 }
 catch(err) {
 const mapped = mapError(err);
 res.status(mapped.status).json(mapped);
 }
 });
}



function doErrors(app) {
 return async function(err, req, res, next) {
 res.status(NOT_FOUND);
 await res.json({code: 'NOT_FOUND', message: err.message});
 };
}

/** Set up error handling for handler by wrapping it in a
 * try-catch with chaining to error handler on error.
 */
function errorWrap(handler) {
 return async (req, res, next) => {
 try {
 await handler(req, res, next);
 }
 catch (err) {
 next(err);
 }
 };
}

/*************************** Mapping Errors ****************************/

const ERROR_MAP = {
 EXISTS: CONFLICT,
 NOT_FOUND: NOT_FOUND
}

/** Map domain/internal errors into suitable HTTP errors. Return'd
 * object will have a "status" property corresponding to HTTP status
 * code.
 */
function mapError(err) {
 return err.isDomain
 ? { status: (ERROR_MAP[err.errorCode] || BAD_REQUEST),
 code: err.errorCode,
 message: err.message
 }
 : { status: NOT_FOUND,
 code: 'NOT_FOUND',
 message: err.toString()
 };
}

/****************************** Utilities ******************************/

/** Return original URL for req**/
function requestUrl(req) {
 const port = req.app.locals.port;
 return `${req.protocol}://${req.hostname}:${port}${req.originalUrl}`;
}

function baseUrl(url) {
 if (url.includes('?')) {
 url = url.substring(0, url.indexOf('?'));
 }
 return url;
}
