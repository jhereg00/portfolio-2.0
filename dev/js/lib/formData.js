/**
 *  Returns an object with all the fields in a form in 'name' : value pairs
 *  @param {HTMLElement:Form}
 */

var formData = function (formElement) {
  var inputs = formElement.querySelectorAll('input,select,textarea');
  var data = {};
  for (var i = 0, len = inputs.length; i < len; i++) {
    // make sure we care...
    if (!inputs[i].name)
      continue;

    if (inputs[i].type == 'checkbox') {
      data[inputs[i].name] = inputs[i].checked ? 1 : 0;
    }
    else if (inputs[i].type == 'radio') {
      if (inputs[i].checked) {
        data[inputs[i].name] = inputs[i].value;
      }
    }
    else {
      data[inputs[i].name] = inputs[i].value;
    }
  }

  return data;
}

module.exports = formData;
