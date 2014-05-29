cloudinary_angular
==================

Angular Directives for Cloudinary

This library can be used as an AMD module or as a standard JS file.

Now that Cloudinary offers an [official Angular library](https://github.com/cloudinary/cloudinary_angular), please consider this library deprecated.

## Setup ######################################################################

It would be helpful if you are familiar with the usage of Cloudinary already.

You will need:

````
jquery.fileupload.js
jquery.cloudinary.js
cloudinary_cors.html
````

In addition, you will need one of the server side libraries to sign your upload parameters.


## Initialization #############################################################

Before angular.cloudinary.js is loaded, make sure the following JS variable is set:

````javascript
CLOUDINARY_CONFIG = {"api_key": "YOUR_API_KEY", "cloud_name": "YOUR_CLOUD_NAME"};
````

Then load the library with a regular script' tag or as an AMD module.

## Usage ######################################################################


### Displaying an Image 

````
<img cl-image class="myClass" id="profilePhoto" height="95" data-crop="fit" public-id="cloudinaryPublicId"/>
````

'cloudinaryPublicId' should a variable in the current scope containing be the Cloudinary public ID of the image.

Other attributes can be set, such as width, etc. 

The WEBP format will automatically be used when it is supported.


### Upload Tag

Using the upload tag is a bit more complicated. You will first need to a signed params object from the server, and I suggest retrieving the upload URL at the same time. To do this we have created a service like this:

````javascript
    angular.module('myCloudinary')
        .factory('cloudinary', function($http) {
            return {
                'getUploadAttrs' : function(tags, cb) {
                $http.get('/api/cloudinary/params/get', {
                    params : {
                        'tstamp' : new Date().getTime(),
                        'tags' : tags
                    }})
                    .success(function(data) {
                        if (data.code == 200) {
                            cb(data);
                        }
                    }).
                    error(function(data, status, headers, config) {
                        alert(status + " | bad");
                    });
            }}
        });
````

This service is called like this:


````javascript
    cloudinary.getUploadAttrs(tags, function(data) {

        data.uploadDone = function(e, cloudinaryResponse) {
            // custom processing to save the new cloudinary ID goes here...
        };

        $scope.cloudinaryData = data;
    }
````

At this point, cloudinaryData will look something like the following. Note that params MUST
be sent and signed by the server, and I recommend retrieving the url from the server as well, although that is not a requirement. You should add the uploadStart and uploadDone callbacks on the client side, 
after you have retrieved signed params.

````javascript
cloudinaryData = {
    url: https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/auto/upload
    formData: {
        timestamp : 1375363550;
        tags : sampleTag,
        api_key : YOUR_API_KEY,
        callback : URL TO cloudinary_cors.html,
        signature : '53ebfe998d4032318c9aba08517d26f7408851a5'
    },
    uploadStart : function(e, response) { },
    uploadDone : function(e, response) { }
}
````

At this point the upload widget should work fine, and when the image is successfully uploaded the 'uploadDone()' callback will be called and you can retrieve the public id.

