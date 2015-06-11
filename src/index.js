'use strict';

let KindaAbstractUI = require('kinda-abstract-ui');
let Dialog = require('./dialog');
let Form = require('./form');
let Input = require('./input');

let KindaWebUI = KindaAbstractUI.extend('KindaWebUI', function() {
  let superCreator = this.creator;
  this.creator = function(options) {
    superCreator.call(this, options);
    this.Dialog = Dialog.inject(this);
    this.Form = Form.inject(this);
    this.Input = Input.inject(this);
  };
});

module.exports = KindaWebUI;
