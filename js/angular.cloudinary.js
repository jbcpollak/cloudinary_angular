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
     * <img cl-image class="..." id="..."  height="..." data-crop="fit" public-id="cloudinaryPublicId"/>
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
         *    url: 'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/auto/upload',
         *    formData : {
         *       timestamp : 1375363550;
         *       tags : sampleTag,
         *       api_key : YOUR_API_KEY,
         *       callback : URL TO cloudinary_cors.html,
         *       signature : '53ebfe998d4018c3329aba08237d23f7458851a5'
         *    }
         *    start : function() { ... },
         *    progress : function() { ... },
         *    done : function() { ... }
         *  }
         *
         *  The start, progress, and done functions are optional callbacks. Other jquery.fileupload callbacks
         *  should be supported, but are untested.
         *
         *  Functions are automatically wrapped in scope.$apply() so it is safe to change variable values
         *  in your callbacks.
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

                        var defaultData = {
                            headers: {"X-Requested-With": "XMLHttpRequest"},
                        };


                        var wrapWithApply = function(callback) {
                            return function(e, cbdata) {
                              var phase = scope.$root.$$phase;
                              if (phase == "$apply")
                              {
                                callback(e, cbdata);
                              } else {
                                scope.$apply(function() {
                                    callback(e, cbdata);
                                });
                              }
                              
                            }
                        }
                        // This wraps each function in data with an angular $apply()
                        // so that changes to scoped variables will be recognized.
                        for (var propt in data) {
                            if (typeof(data[propt]) === "function") {
                                data[propt] = wrapWithApply(data[propt]);
                            }
                        }

                        var completeData = angular.extend(defaultData, data);

                        element.cloudinary_fileupload(
                            completeData
                        );

                    }
                });
            }

        };
    })
    .run(['$window', function($window) {
      // This initializes cloudinary_js iff the global CLOUDINARY_CONFIG is defined.
      // Otherwise, if CLOUDINARY_CONFIG is not defined the application must manually init cloudinary_js.
      if ($window.CLOUDINARY_CONFIG) {
        $.cloudinary.config($window.CLOUDINARY_CONFIG);
      }
    }]);
}));
