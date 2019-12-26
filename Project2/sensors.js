'use strict';

const AppError = require('./app-error');
const validate = require('./validate');

const assert = require('assert');
const mongo = require('mongodb').MongoClient;

class Sensors {


    /** Return a new instance of this class with database as
     *  per mongoDbUrl.  Note that mongoDbUrl is expected to
     *  be of the form mongodb://HOST:PORT/DB.
     */
    constructor(client,db,stype,ssensor,sdata)
    {
        this.client = client;
        this.db = db;
        this.stype = stype;
        this.ssensor = ssensor;
        this.sdata = sdata;
    }
    static async newSensors(mongoDbUrl) {
	let res = mongoDbUrl.split("/");
        const client = await mongo.connect(mongoDbUrl,MONGO_OPTIONS);
        const db = client.db(res[3]);
        const stype = db.collection('stype');
        const ssensor = db.collection('ssensor');
        const sdata = db.collection('sdata');
        return new Sensors(client,db,stype,ssensor,sdata);
    }

    /** Release all resources held by this Sensors instance.
     *  Specifically, close any database connections.
     */
    async close() {
        await this.client.close();
    }

    /** Clear database */
    async clear() {
        await this.db.dropDatabase();
    }

    /** Subject to field validation as per validate('addSensorType',
     *  info), add sensor-type specified by info to this.  Replace any
     *  earlier information for a sensor-type with the same id.
     *
     *  All user errors must be thrown as an array of AppError's.
     */
    async addSensorType(info) {
        const sensorType = validate('addSensorType', info);
        sensorType._id = sensorType.id;
        await this.stype.insertOne(sensorType);
    }

    /** Subject to field validation as per validate('addSensor', info)
     *  add sensor specified by info to this.  Note that info.model must
     *  specify the id of an existing sensor-type.  Replace any earlier
     *  information for a sensor with the same id.
     *
     *  All user errors must be thrown as an array of AppError's.
     */
    async addSensor(info) {
        const sensor = validate('addSensor', info);
        sensor._id = sensor.id;
        await this.ssensor.insertOne(sensor);
    }

    /** Subject to field validation as per validate('addSensorData',
     *  info), add reading given by info for sensor specified by
     *  info.sensorId to this. Note that info.sensorId must specify the
     *  id of an existing sensor.  Replace any earlier reading having
     *  the same timestamp for the same sensor.
     *
     *  All user errors must be thrown as an array of AppError's.
     */
    async addSensorData(info) {
        const sensorData = validate('addSensorData', info);
        //sensorData._id = sensorData.sensorId;
        let c = await this.sdata.findOne({_id:sensorData.sensorId});
        if(c)
        {
            let data = [];
            data = c.data;
            data.push(sensorData);
            await this.sdata.updateOne({_id:sensorData.sensorId}, {$set: { data }});
        }else{
            let data = [];
            data.push(sensorData);
            await this.sdata.insertOne({_id:sensorData.sensorId, data});
        }
    }

    /** Subject to validation of search-parameters in info as per
     *  validate('findSensorTypes', info), return all sensor-types which
     *  satisfy search specifications in info.  Note that the
     *  search-specs can filter the results by any of the primitive
     *  properties of sensor types (except for meta-properties starting
     *  with '_').
     *
     *  The returned value should be an object containing a data
     *  property which is a list of sensor-types previously added using
     *  addSensorType().  The list should be sorted in ascending order
     *  by id.
     *
     *  The returned object will contain a lastIndex property.  If its
     *  value is non-negative, then that value can be specified as the
     *  _index meta-property for the next search.  Note that the _index
     *  (when set to the lastIndex) and _count search-spec
     *  meta-parameters can be used in successive calls to allow
     *  scrolling through the collection of all sensor-types which meet
     *  some filter criteria.
     *
     *  All user errors must be thrown as an array of AppError's.
     */
    async findSensorTypes(info) {
        const searchSpecs = validate('findSensorTypes', info);
        let filters = {};
        for(let k in searchSpecs)
        {
            if(k==="_index" || k==="_count")
            {
                continue;
            }else if(k==="id" && searchSpecs[k]===null)
                continue;
            else{
                if(k==="limits")
                {
                    if(searchSpecs[k]['min']!==undefined)
                        filters['limits.min'] = Number(searchSpecs[k]['min']);
                    if(searchSpecs[k]['max']!==undefined)
                        filters['limits.max'] = Number(searchSpecs[k]['max']);
                }
                else
                    filters[k] = searchSpecs[k];
            }
        }
        let index = -1;
        let c = await this.stype.find(filters).count();
        if(c > searchSpecs._index+searchSpecs._count)
            index = searchSpecs._index+searchSpecs._count;
         let element = await this.stype.find(filters).sort({_id:1}).skip(searchSpecs._index).limit(searchSpecs._count).toArray();
	for(let i = 0;i<element.length;i++)
	{
		delete(element[i]._id);
	}
         return { data: element, nextIndex: index };
    }


    /** Subject to validation of search-parameters in info as per
     *  validate('findSensors', info), return all sensors which satisfy
     *  search specifications in info.  Note that the search-specs can
     *  filter the results by any of the primitive properties of a
     *  sensor (except for meta-properties starting with '_').
     *
     *  The returned value should be an object containing a data
     *  property which is a list of all sensors satisfying the
     *  search-spec which were previously added using addSensor().  The
     *  list should be sorted in ascending order by id.
     *
     *  If info specifies a truthy value for a _doDetail meta-property,
     *  then each sensor S returned within the data array will have an
     *  additional S.sensorType property giving the complete sensor-type
     *  for that sensor S.
     *
     *  The returned object will contain a lastIndex property.  If its
     *  value is non-negative, then that value can be specified as the
     *  _index meta-property for the next search.  Note that the _index (when
     *  set to the lastIndex) and _count search-spec meta-parameters can be used
     *  in successive calls to allow scrolling through the collection of
     *  all sensors which meet some filter criteria.
     *
     *  All user errors must be thrown as an array of AppError's.
     */
    async findSensors(info) {
        //@TODO
        const searchSpecs = validate('findSensors', info);
        let filters = {};
        for(let k in searchSpecs)
        {
            if(k==="_index" || k==="_count" || k==="_doDetail")
            {
                continue;
            }else if(k==="id" && searchSpecs[k]===null)
                continue;
            else{
                if(k==="expected")
                {
                    if(searchSpecs[k]['min']!==undefined)
                        filters['expected.min'] = Number(searchSpecs[k]['min']);
                    if(searchSpecs[k]['max']!==undefined)
                        filters['expected.max'] = Number(searchSpecs[k]['max']);
                }else if(k==="period")
                    filters[k] = Number(searchSpecs[k]);
                else
                    filters[k] = searchSpecs[k];
            }
        }
        let index = -1;
        let c = await this.ssensor.find(filters).count();
        if(c > searchSpecs._index+searchSpecs._count)
            index = searchSpecs._index+searchSpecs._count;
        let element = await this.ssensor.find(filters).sort({_id:1}).skip(searchSpecs._index).limit(searchSpecs._count).toArray();
	for(let i = 0;i<element.length;i++)
	{
		delete(element[i]._id);
	}
        if(searchSpecs['_doDetail']==="true"){
            let sensorType = await this.stype.findOne({_id:element[0]['model']});
            return { data: element, sensorType, nextIndex: -1 };
        }

        return { data: element, nextIndex: index };
    }

    /** Subject to validation of search-parameters in info as per
     *  validate('findSensorData', info), return all sensor readings
     *  which satisfy search specifications in info.  Note that info
     *  must specify a sensorId property giving the id of a previously
     *  added sensor whose readings are desired.  The search-specs can
     *  filter the results by specifying one or more statuses (separated
     *  by |).
     *
     *  The returned value should be an object containing a data
     *  property which is a list of objects giving readings for the
     *  sensor satisfying the search-specs.  Each object within data
     *  should contain the following properties:
     *
     *     timestamp: an integer giving the timestamp of the reading.
     *     value: a number giving the value of the reading.
     *     status: one of "ok", "error" or "outOfRange".
     *
     *  The data objects should be sorted in reverse chronological
     *  order by timestamp (latest reading first).
     *
     *  If the search-specs specify a timestamp property with value T,
     *  then the first returned reading should be the latest one having
     *  timestamp <= T.
     *
     *  If info specifies a truthy value for a doDetail property,
     *  then the returned object will have additional
     *  an additional sensorType giving the sensor-type information
     *  for the sensor and a sensor property giving the sensor
     *  information for the sensor.
     *
     *  Note that the timestamp search-spec parameter and _count
     *  search-spec meta-parameters can be used in successive calls to
     *  allow scrolling through the collection of all readings for the
     *  specified sensor.
     *
     *  All user errors must be thrown as an array of AppError's.
     */
    async findSensorData(info) {
        //@TODO
        const searchSpecs = validate('findSensorData', info);
        let id = searchSpecs.sensorId;
        let count = searchSpecs._count;
        let statuses = searchSpecs.statuses;
        let timestamp = searchSpecs.timestamp;
        let dodetail = searchSpecs._doDetail;
        let element = await this.sdata.findOne({_id:searchSpecs.sensorId});
        let arr = element.data;
        arr.sort(function(data1, data2) {
            return data2["timestamp"] - data1["timestamp"];
        });
        let sensorJson = await this.ssensor.findOne({_id:id});
        let min = parseInt(sensorJson["expected"]["min"], 10); let max = parseInt(sensorJson["expected"]["max"], 10);
        let result = new Array();
        for(let i=0; i<arr.length && count>0; i++)
        {
            if(timestamp!=null && timestamp < arr[i]["timestamp"])
                continue;
            let value = parseInt(arr[i]["value"], 10);
            let status;
            if(value>=min && value<=max)
                status = "ok";
            else if(value<min)
                status = "error";
            else
                status = "outOfRange";
            if(statuses.length===0 || statuses.has(status))
            {
                let temp = {
                    "timestamp" : arr[i]["timestamp"],
                    "value" : arr[i]["value"],
                    "status" : status
                }
                result.push(temp);
                count--;
            }
        }
	for(let i = 0;i<result.length;i++)
	{
		delete(result[i]._id);
	}
        let resultWrapper = {
            "data" : result
        }
        if(dodetail==="true")
        {
            let sensor = await this.ssensor.findOne({_id:id});
            let type = await this.stype.findOne({_id:sensor.model});
            resultWrapper["sensorType"] = type;
            resultWrapper["sensor"] = sensor;
        }
        return resultWrapper;

    }



} //class Sensors

const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'sensors';

module.exports = Sensors.newSensors;

//Options for creating a mongo client
const MONGO_OPTIONS = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};



function inRange(value, range) {
    return Number(range.min) <= value && value <= Number(range.max);
}
