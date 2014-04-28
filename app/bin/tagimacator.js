/***********************************************************************************************************************************************
 * TAGIMACATOR APP
 ***********************************************************************************************************************************************
 * @description On page-load/navigation: 
 */
var tagimacatorApp = angular.module('tagimacatorApp', []);

/***********************************************************************************************************************************************
 * TAGIMACATOR DIRECTIVE
 ***********************************************************************************************************************************************
 * @description TAGIMACATE ALL THE THINGS!
 */
tagimacatorApp.directive('tagimacator', function($http, $parse, $rootElement) {
  return {
    restrict: 'EA',
    templateUrl: Drupal.settings.unfiDigitalCoreApp.modulePath + 'scripts/directives/templates/tagimacator.html',
    scope: true,
    controller: function($scope, $element, $attrs, $compile) {

      /**
       * CLASS TOGGLE
       * 
       * @type {String}
       */
      var classToggle = 'tagimacated';

      //
      // MAIN TAGGING OPERATIONS
      //------------------------------------------------------------------------------------------//
      // @description
      
      /**
       * TAGS
       *
       * @description Tag searchlist element pointer.
       * @type {[type]}
       */
      var tags = undefined;

      /**
       * SEARCH MODEL
       *
       * @description Hides/shows items in the result set. Originally, this was
       *              using Array.filter to simply return a new result set that
       *              was iteratable through ng-repeat.
       *
       *              While this method is defintely more efficient and decoupled from DOM
       *              details, it is significantly less performant with large quantities
       *              of data.
       *
       *              Also, managing what tags have been selected becomes drastically easier
       *              when the elements themselves aren't being removed.
       * @return {[type]} [description]
       */
      $scope.tagimacate = function() {
        var query = $scope.tagimacator.text;
        
        $scope.isTagimacating = true;

        if(!tags) {
          tags = $element[0].querySelectorAll('.tagimacator-search-list li');
        }

        if(query) {
          for(var i=0; i<tags.length; i++) {
            if(!tags[i].textContent.toLowerCase().match(query.toLowerCase())) {
              tags[i].style.display = "none";
            } else {
              tags[i].style.display = "block";
            }
          }
        } else {
          for(var i=0; i<tags.length; i++) {
            tags[i].style.display = "block";
          }
        }
      };

      /**
       * TAGIMACAN
       *
       * @description Applies the selected class and mangages array population.
       * @param  {[type]} e   [description]
       * @param  {[type]} itm [description]
       * @return {[type]}     [description]
       */
      $scope.tagimacan = function(e, itm) {

        if($scope.saveTo.indexOf(itm[$scope.saveBy]) === -1) {
          e.target.classList.add(classToggle);
          $scope.tagimacated.push(itm);
          $scope.saveTo.push(itm[$scope.saveBy]);
        }
      };

      /**
       * TAGIMACANT
       *
       * @description Removes class name and manages array splicing.
       * @param  {[type]} itm [description]
       * @return {[type]}     [description]
       */
      $scope.tagimacant = function(itm) {
        var idx = $scope.saveTo.indexOf(itm[$scope.saveBy]),
            selected;

        if(idx > -1) {
          $scope.tagimacated.splice(idx, 1);
          $scope.saveTo.splice(idx, 1);

          selected = $element[0].querySelectorAll('.'+classToggle);

          for(var i=0; i<selected.length; i++) {
            if(selected[i].textContent === itm[$scope.filter]) {
              selected[i].classList.remove(classToggle);
            }
          }
        }
      };
    },
    link: function($scope, $element, $attrs) {
      
      //
      // TAGIMACATOR MODELS
      //------------------------------------------------------------------------------------------//
      // @description In the Link function attrs are already interpolated.
      
      // Tagimacator model, only houses .text right now but is ready for more
      $scope.tagimacator = {};

      // Return from data_url or data_src
      $scope.data = [];

      // Results from tagimacate
      $scope.filterResults = [];

      // User supplied data url
      $scope.data_url = $attrs.tagimacatorDataUrl || null;

      // User supplied data object
      $scope.data_src = $attrs.tagimacatorDataSrc || null;

      // user supplied save property
      $scope.saveTo = $parse($attrs.tagimacatorSaveTo)($scope) || null;

      // User supplied filter property
      $scope.filter = $attrs.tagimacatorFilterBy || null;

      // user supplied save property
      $scope.saveBy = $attrs.tagimacatorSaveBy || null;

      // Selected tags
      $scope.tagimacated = [];

      // State for determining tagimacation.
      $scope.isTagimacating = false;

      //
      // INIT ERRORS
      //------------------------------------------------------------------------------------------//
      // @description
      
      // If no data sources provided
      if($scope.data_src && $scope.data_url) {
        console.error('Tagimacator - You provided both data-src and data-url, please pick one or the other on: ', $element[0]);
      }

      // If no model provided
      if(!$scope.saveTo) {
        throw 'Tagimacator - Tagimacator must be provided with a tagimacator-save-to attribute to work properly.';
      }

      // If the model is not an array
      if($scope.saveTo.constructor !== Array) {
        console.error('Tagimacator - The save-to you use needs to be a a JSON structure for the time being. This will be more versatile in future releases.')
      }

      // If no filter provided
      if(!$scope.filter) {
        throw 'Tagimacator - You must provide a property whereby we are able to filter results';
      }

      // If saveBy not provided
      if(!$scope.saveBy) {
        console.warn('Tagimacator - no "saveBy" attribute provided, falling back to filter to save to model');
        // Fallback
        $scope.saveBy = $scope.filter;
      }

      //
      // DATA ASSIGNMENT
      //------------------------------------------------------------------------------------------//
      // @description

      if($scope.data_url) {
        $http({method:'GET', url: $scope.data_url}).success(function(data) {
          $scope.filterResults = $scope.data = (data && data.results)? data.results : (data)? data : null;
        }).error(function() {
          console.error('Tagimacator - data could not be fetched from : '+$scope.data_url + ' on: ', $element[0]);
        });
      } else if($scope.data_src) {
        $scope.filterResults = $scope.data = $scope.data_src;
      }

      //
      // EVENTS
      //------------------------------------------------------------------------------------------//
      // @description
      
      $scope.searchList = $element[0].querySelectorAll('.tagimacator-search-list')[0];
      $scope.taggedList = $element[0].querySelectorAll('.tagimacator-selected-list')[0];
      $scope.tagInput = $element[0].querySelectorAll('input[type=text]')[0];

      // Hides the results when not clicking in them.
      $rootElement.click(function(e) {
        if($scope.isTagimacating && e.target !== $element[0] && e.target !== $scope.searchList && e.target !== $scope.taggedList && e.target !== $scope.tagInput
          && e.target.parentElement !== $scope.searchList && !e.target.classList.contains('tagimacant')) {
          $scope.isTagimacating = false;
          $scope.$apply();
        }
      });
    }
  }
})
