/**
 *  AjaxRequest
 *
 *  Create a new instance to make a new request, or just call the exported
 *  function because it will create a new instance automatically if needed. All
 *  options are optional. Url is not.
 *
 *  All functions (complete, success, and error) are passed the response text
 *  and the xhttp request as arguments.
 *
 *  @param {string} url
 *  @param {object} options
 *    @param {string} method - HTTP method to use, defaults to "GET"
 *    @param {object} data - object of data to send
 *    @param {function} complete - function to call when request is complete, successful or not
 *    @param {function} success - function to call when request completes with status code 2xx
 *    @param {function} error - function to call when request fails or completes with status code 4xx or 5xx
 *
 *  @method addStateListener
 *    @param {int} stateIndex
 *    @param {Function} callback - function to call when that state is reached
 *      passed 2 arguments: `{string} responseText`, `{XMLHttpRequest} the request object`
 *  @method getReadyState
 *    @returns {int} readyState of request
 *
 *  @prop {static enum} readyState
 *    @prop UNSENT
 *    @prop OPENED
 *    @prop HEADERS_RECEIVED
 *    @prop LOADING
 *    @prop DONE
 */

var AjaxRequest = function (url, options) {
  if (!(this instanceof AjaxRequest))
    return new AjaxRequest(url, options);

  // things we'll need
  this.stateFns = []; // array of arrays of functions to call on any given ready state
  for (var i = 0; i < 5; i++)
    this.stateFns.push([]);

  options = options || {};
  options.type = options.type || "GET";
  this.options = options;

  // handle data
  var dataStr = "";
  for (var prop in options.data) {
		dataStr += (dataStr === "" ? "" : "&") + prop + "=" + encodeURI(options.data[prop]);
  }

  // make actual request
	var xhttp = this.xhttp = new XMLHttpRequest();

  // listen for state changes, and apply functions as necessary
  var _this = this;
  xhttp.onreadystatechange = function () {
    if (_this.stateFns[this.readyState] && _this.stateFns[this.readyState].length) {
      for (var i = 0, len = _this.stateFns[this.readyState].length; i < len; i++) {
        _this.stateFns[this.readyState][i](this.responseText, this);
      }
    }
	}

  // listen for it to finish
  this.addStateListener(AjaxRequest.readyState.DONE, function (responseText, xhttp) {
    // done
    if (options.complete && typeof options.complete === 'function') {
      options.complete(xhttp.responseText, xhttp);
    }

    // success or fail
    if (xhttp.status === 200) {
      if (options.success && typeof options.success === 'function') {
        options.success(xhttp.responseText, xhttp);
      }
    }
    else if (options.error && typeof options.error === 'function') {
      options.error(xhttp.responseText, xhttp);
    }
  });

  // open and send the request
	xhttp.open(options.type,(dataStr && options.type === 'GET' ? url + '?' + dataStr : url),true);
  // web-standards compliant x-requested-with
  xhttp.setRequestHeader("X-Requested-With","XMLHttpRequest");
	if (options.type !== 'GET' && dataStr) {
		xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		xhttp.send(dataStr);
	}
	else {
		xhttp.send();
	}

  this.xhttp = xhttp;
}
AjaxRequest.prototype = {
  addStateListener: function (stateIndex, fn) {
    // call immediately if already at that state
    if (this.xhttp.readyState === stateIndex) {
      fn(xhttp.responseText, xhttp);
    }
    this.stateFns[stateIndex].push(fn);
  },
  getReadyState: function () {
    return this.xhttp.readyState;
  }
}

// enum state
AjaxRequest.readyState = {
  UNSENT: 0,
  OPENED: 1,
  HEADERS_RECEIVED: 2,
  LOADING: 3,
  DONE: 4
}

module.exports = AjaxRequest;
