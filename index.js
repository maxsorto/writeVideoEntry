'use strict';

const AWS = require('aws-sdk'),      
      dynamo = new AWS.DynamoDB.DocumentClient();

/*
Lambda function expects SNS trigger event indicating an Elastic Transcoder job is done...
*/
exports.handler = (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = false;
    
    //Set videoID from SNS event received from Elastic Transcoder.
    let videoId = JSON.parse(event.Records[0].Sns.Message).input.key.split('-')[1];

    insertItem(buildItem(videoId))
    .then(res => {
        callback(null, {
            success: true,
            message: res
        }); 
    })
    .catch(error =>{
        callback(null, {
            success: false,
            message: error
        }); 
    });
};

/*
Builds an item to be written to DynamoDB...
*/
function buildItem(videoId)
{   
    let videoItem = {
            video_id: parseInt(videoId).toString(16), // <-- Set a hexadecimal ID for entry.
            timeinserted: new Date().getTime(), // <-- Set a UNIX timestamp for entry.
            video_hd: `output/adb_cb17-${videoId}-video_HD.mp4`, // <-- Directory to look for in S3.
            thumbnail: `output/adb_cb17-${videoId}-video_still_thumbnail-00001.jpg`,            
            still_1: `output/adb_cb17-${videoId}-video_still-00001.jpg`,
            still_2: `output/adb_cb17-${videoId}-video_still-00002.jpg`,
            still_3: `output/adb_cb17-${videoId}-video_still-00003.jpg`
        };

    return videoItem;
}

/*
Inserts item to DynamoDB...
*/
function insertItem(item)
{
    return new Promise((resolve, reject) => {

        let params = {
            TableName: 'medium_post_demo',
            Item: item
        };

        dynamo.put(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve('All done here.');
            }
        });
    });
}