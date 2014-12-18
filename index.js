"use strict";

var _ = require('lodash');
var ui = require('kinda-ui').create();

var webUI = _.clone(ui);

webUI.Form = require('./form');
webUI.Input = require('./input');
webUI.Dialog = require('./dialog');

var WebUI = {
  create: function() {
    return webUI;
  }
};

module.exports = WebUI;
