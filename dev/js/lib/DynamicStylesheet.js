/**
 *  Dynamic Css updating
 *
 *  @method createSheet () - shouldn't need to use this, it's called by the constructor
 *  @method clearRules ()
 *  @method buildRules ()
 *  @method setStyle - sets styles for a selector
 *    @param selector :: String
 *    @param rules :: object with key as the css property (hyphenated, not js style) and value as the string value
 *  @method removeStyle
 *    @param selector :: String
 *    @param rules :: String or Array of property names to remove
 */

var extend = require('lib/extendObject');

function DCSS () {
    this.sheet = this.createSheet();
    this.styles = {};
}

DCSS.prototype = {
  createSheet : function(){
    // make a sheet and add it
    var style = document.createElement('style');
    // WebKit hack (thanks, David Walsh)
    style.appendChild(document.createTextNode(""));

    // add to page
    if( document.head ){
      document.head.appendChild(style);
    }
    else {
      var head = document.getElementsByTagName('head')[0];
      head.appendChild(style);
    }

    if( style.sheet )
      return style.sheet;
    else {
      return document.styleSheets[(document.styleSheets.length - 1)];
    }
  },
  clearRules : function() {
    if( this.sheet.cssRules ){
      while( this.sheet.cssRules.length ){
        this.sheet.deleteRule(0);
      }
    }
    else {
      while( this.sheet.rules.length ){
        this.sheet.removeRule(0);
      }
    }
  },
  buildRules : function() {
    this.clearRules();
    for(var sel in this.styles){
      var rules = "";
      for(var dec in this.styles[sel]){
        rules += dec + ': ' + this.styles[sel][dec] + '; ';
      }
      if( this.sheet.insertRule ){
        this.sheet.insertRule(sel + '{' + rules + '}',this.sheet.cssRules.length);
      }
      else {
        this.sheet.addRule(sel,rules);
      }
    }
  },
  setStyle : function( selector , rules ){ // pass rules as an object
    this.styles[selector] = extend(this.styles[selector] || {}, rules);
    this.buildRules();
  },
  removeStyle : function( selector , rules ){
    if( !(rules instanceof Array) )
      rules = [rules];

    for( var i = 0; i < rules.length; i++ ){
      if( this.styles[selector] && this.styles[selector][rules[i]])
        delete this.styles[selector][rules[i]];
    }
    this.buildRules();
  }
};

module.exports = DCSS;
