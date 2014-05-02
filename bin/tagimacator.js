/***********************************************************************************************************************************************
 * TAGIMACATOR
 ***********************************************************************************************************************************************
 * @description TAGIMACATE ALL THE THINGS!
 */
var tagimacatorApp = angular.module('tagimacator', []);

tagimacatorApp.directive('tagimacator', function($parse, $rootElement, $q) {
  return {
    restrict: 'EA',
    replace:true,
    templateUrl: 'bin/templates/tagimacator.html',
    scope: true,
    controller: function($scope, $element, $attrs, $compile) {

      //
      // GENERAL
      //------------------------------------------------------------------------------------------//
      // @description
      
      // Class toggling class
      var classToggle = 'tagimacated';

      // Holds the tag search list
      var tags = undefined;
      
      //
      // TIME MANAGEMENT
      //------------------------------------------------------------------------------------------//
      // @description
      
      /**
       * TIMER
       *
       * @description Object that stores all time related functionality
       * @type {Object}
       */
      var Timer = {};

      // Debounce Interval
      Timer.debounceInterval = $attrs.tagimacatorDebounceInterval || 250;

      // Time value that gets manipulated
      Timer.currentTime;

      // Store the setInterval function
      Timer.interval;

      /**
       * RUN
       *
       * @description Runs the timer down.
       * @return {[type]} [description]
       */
      Timer.run = function() {
        var self = this;

        // Set/reset time.
        this.currentTime = this.debounceInterval;

        // Prevent the current interval from running;
        clearInterval(self.interval);

        // Create a new one.
        // We use setInterval here to get as close to a 1ms
        // representation as possible. Traditional forloop
        // runs way faster than 1ms/iteration. (if doing a simple -- operation like below, that is.)
        this.interval = setInterval(function() {
          // Decrement time
          self.currentTime--;

          // Check for timeout.
          if(self.currentTime === 0) {
            // Run the callback
            self.onTimeout();
            // If it timesout, clear the interval
            clearInterval(self.interval);
          }
        }, 1);
      };

      /**
       * ON TIMEOUT
       *
       * @description Function to run when a clock runs out successfully
       * @type {[type]}
       */
      Timer.onTimeout = search;

      /**
       * GET TIME
       *
       * @description Get the current time.
       * @return {[type]} [description]
       */
      Timer.getTime = function() {
        return this.currentTime;
      };

      //
      // MAIN TAGGING OPERATIONS
      //------------------------------------------------------------------------------------------//
      // @description
      
      /**
       * TAGIMACATE
       *
       * @description Runs the debouncer.
       * @return {[type]} [description]
       */
      $scope.tagimacate = function() {
        // Run the timer after every keystroke
        Timer.run();
      };

      /**
       * SEARCH
       *
       * @description Serves as the callback for the Timer object
       *              upon completing a whole unit of time.
       *              
       * @return {[type]} [description]
       */
      function search() {
        // Grab text model
        var query = $scope.tagimacator.text;
        
        // Flag set for closing filter list when
        // de-focused.
        $scope.isTagimacating = true;

        if(query) {
          // Perform query through Array.filter.
          $scope.data = $scope.origData.filter(function(itm, idx) {
            if(itm[$scope.filter] && itm[$scope.filter].toLowerCase().match(query.toLowerCase())) {
              return itm;
            }
          });

          // Update data processing properties
          $scope.updateTagimcatedDataProcessing($scope.data);
        } else {
          // Reset the data
          $scope.data = $scope.origData;
          $scope.updateTagimcatedDataProcessing($scope.data);
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

        // If not in model
        if($scope.saveTo.indexOf(itm[$scope.saveBy]) === -1) {
          // Add selected class
          itm.tagimacateSelected = true;
          // Add to selected group
          $scope.tagimacated.push(itm);
          // Save to model
          $scope.saveTo.push(itm[$scope.saveBy]);
          // Run save callback
          $scope.onTagSelect(itm);
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
        var idx = $scope.saveTo.indexOf(itm[$scope.saveBy]);

        // If in model
        if(idx > -1) {
          // Remove from selected group
          $scope.tagimacated.splice(idx, 1);
          // Remove from model
          $scope.saveTo.splice(idx, 1);
          // Remove selected class
          itm.tagimacateSelected = false;
          // Run deselection callback
          $scope.onTagDeselect(itm);
        }
      };

      //
      // LAZY LOADING
      //------------------------------------------------------------------------------------------//
      // @description Lazy Loading depends on three different pointers for the same data.
      //              The first one is 'origData'. This is the original, non-mutated origin of data
      //              from the server. The second is 'data'. This is the result set of the curren
      //              queries, the third is 'filterResults' which is the lazy-loading friendly,
      //              interpolated subset of 'data'.
      
      // Query results placeholder.
      $scope.data = [];

      // Contains the amount of tags to load at one time.
      $scope.stepBy = 250;

      // Current loading step.
      $scope.currentStep = 1;

      // Available steps.
      $scope.maxStep;

      // Pixel threshold to trigger lazy-loading.
      $scope.threshold = 100;

      // Position of last scrolled in the list.
      $scope.lastScrolled = 0;

      /**
       * INITIALIZE TAGIMACATED PROCESSING
       *
       * @description Sets pertinent scope properties and preps lazy loading.
       * @param  {[type]} data [description]
       * @return {[type]}      [description]
       */
      $scope.initTagimcatedDataProcessing = function(data) {

        $scope.data = data;

        $scope.searchList = $element[0].querySelectorAll('.tagimacator-search-list')[0];

        $scope.searchList.onscroll = $scope.scroller;

        $scope.maxStep = Math.floor($scope.data.length / $scope.stepBy);

        $scope.filterResults = $scope.data.slice(0, $scope.stepBy);
      };

      /**
       * UPDATE TAGIMACATED DATA PROCESSING
       *
       * @description Updates specific scope properties upon completing a query.
       * @param  {[type]} data [description]
       * @return {[type]}      [description]
       */
      $scope.updateTagimcatedDataProcessing = function(data) {

        $scope.maxStep = Math.floor($scope.data.length / $scope.stepBy);

        $scope.filterResults = $scope.data.slice(0, $scope.stepBy);

        // set scroll positions back to zero
        $scope.searchList.scrollTop = $scope.lastScrolled = 0;

        $scope.$apply();
      };

      /**
       * SCROLLER
       *
       * @description Serves as the onscroll callback.
       * @param  {[type]} e [description]
       * @return {[type]}   [description]
       */
      $scope.scroller = function(e) {
        if(e.target.scrollTop >= $scope.lastScrolled && e.target.scrollHeight - (e.target.scrollTop + e.target.clientHeight) <= $scope.threshold) {       
          // Set new baseline - prevents triggering lazyloader when scrollig up from the very bottom
          $scope.lastScrolled = e.target.scrollTop;
          // Run user-provided loader
          $scope.lazyLoad();
        }
      };

      /**
       * LAZY LOAD
       *
       * @description Core of the lazyloading process, updates step and creates new data subset.
       * @return {[type]} [description]
       */
      $scope.lazyLoad = function() {
        if($scope.currentStep <= $scope.maxStep) {

          $scope.currentStep++;

          $scope.filterResults = $scope.data.slice(0, (Math.floor($scope.stepBy*$scope.currentStep)));

          $scope.$apply();

          $scope.searchList.scrollTop = $scope.lastScrolled;
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

      // Results from tagimacate
      $scope.filterResults = [];

      // User supplied data url
      $scope.tagimacatorData = $parse($attrs.tagimacatorData)($scope);

      // user supplied save property
      $scope.saveTo = $parse($attrs.tagimacatorSaveTo)($scope) || null;

      // On select
      $scope.onTagSelect = $parse($attrs.tagimacatorOnSelect)($scope) || function() {};

      // On de-select
      $scope.onTagDeselect = $parse($attrs.tagimacatorOnDeselect)($scope) || function() {};

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

      $scope.loadTagimacatedData = function() {
        var def = $q.defer();

        if($scope.tagimacatorData) {
          if($scope.tagimacatorData.constructor === Function) {
            $scope.tagimacatorData().then(function(data) {
              def.resolve(data);
            });
          } else if($scope.tagimacatorData.constructor === Array) {
            def.resolve($scope.tagimacatorData);
          }
        } else {
          throw 'Tagimacator - no [tagimacator-data] attribute provide. How shal we know what data to tagimacate upon?';
        }

        return def.promise;
      };

      $scope.loadTagimacatedData().then(function(data) {
        // Set orig data here
        $scope.origData = data;

        $scope.initTagimcatedDataProcessing(data);
      });

      //
      // EVENTS
      //------------------------------------------------------------------------------------------//
      // @description
      // 
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
