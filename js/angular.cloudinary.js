(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery.cloudinary'
        ], factory);
    } else {
        // Browser globals:
        factory();
    }
}(function () {
    'use strict';

    angular.module('cloudinary', [])
    /**
     *
     * HTML:
     *
     * <img cl-image class="..." id="..."  height="..." data-crop="fit" public-id="{{cloudinaryPublicId}}"/>
     *
     */
    .directive('clImage', function() {
        return {
            restrict : 'EA',
            replace : true,
            transclude : false,
            scope : {
                publicId : "="
            },
            // The linking function will add behavior to the template
            link : function(scope, element, attrs) {
                scope.$watch('publicId', function(value) {
                    if (!value) return;

                    element.webpify({'src' : value + '.jpg'});
                });
            }
        };
    })
    .directive('clUpload', function($compile) {
        /**
         *
         * HTML:
         *
         * <div id="photo-upload-btn" class="photo-upload-btn" cl-upload data="cloudinaryData"/>
         *
         * JavaScript:
         *
         *  cloudinaryData = {
         *    url: https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/auto/upload
         *    params : {
         *       timestamp : 1375363550;
         *       tags : sampleTag,
         *       api_key : YOUR_API_KEY,
         *       callback : URL TO cloudinary_cors.html,
         *       signature : '53ebfe998d4018c3329aba08517d26f7408851a5'
         *    },
         *    uploadStart : function(e, response) { },
         *    uploadDone : function(e, response) { }
         *  }
         *
         */
        return {
            restrict : 'EA',
            replace : true,
            template : '<input name="file" type="file" class="cloudinary-fileupload" data-cloudinary-field="image_id" />',
            scope : {
                data : "="
            },
            // The linking function will add behavior to the template
            link : function(scope, element, attrs) {
                scope.$watch('data', function(data) {
                    if (data) {
                        element.cloudinary_fileupload({
                            formData: data.params,
                            url : data.url,
                            headers: {"X-Requested-With": "XMLHttpRequest"}
                        });

                        if (data.uploadStart) {
                            element.bind('fileuploadstart', function(e, cloudinaryResponse) {
                                scope.$apply(function() {
                                    data.uploadStart(e, cloudinaryResponse);
                                });
                            });
                        }

                        if (data.uploadDone) {
                            element.bind('cloudinarydone', function (e, cloudinaryResponse) {
                                scope.$apply(function() {
                                    data.uploadDone(e, cloudinaryResponse);
                                });
                            });
                        }
                    }
                });
            }

        };
    })
    .config(function() {
        $.cloudinary.config(CLOUDINARY_CONFIG);
    });
}));
