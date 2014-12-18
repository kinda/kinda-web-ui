"use strict";

var _ = require('lodash');
var co = require('co');
var React = require('react');
var util = require('kinda-util').create();
var tr = require('kinda-translator').create();
var Dialog = require('./dialog');

var Form = React.createClass({
  getInitialState: function() {
    return {
    };
  },

  componentDidMount: function() {
    this.inputComponents = [];
    this.getDOMNode().addEventListener(
      'inputComponentDidMount', this.inputComponentDidMount);
    this.getDOMNode().addEventListener(
      'inputComponentWillUnmount', this.inputComponentWillUnmount);
  },

  componentWillUnmount: function() {
    this.inputComponents = undefined;
    this.getDOMNode().removeEventListener(
      'inputComponentDidMount', this.inputComponentDidMount);
    this.getDOMNode().removeEventListener(
      'inputComponentWillUnmount', this.inputComponentWillUnmount);
  },

  inputComponentDidMount: function(e) {
    this.inputComponents.push(e.detail.inputComponent);
  },

  inputComponentWillUnmount: function(e) {
    _.pull(this.inputComponents, e.detail.inputComponent);
  },

  checkValidity: function() {
    var invalidInputs = [];
    this.inputComponents.forEach(function(input) {
      if (!input.checkValidity().isValid)
        invalidInputs.push(input);
    }, this);
    return {
      isValid: invalidInputs.length === 0,
      invalidInputs: invalidInputs
    };
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var validity = this.checkValidity();
    if (!validity.isValid) {
      co(function *() {
        yield Dialog.alert(tr('kinda-ui.missingOrInvalidInformation'));
        var firstInput, firstInputRect;
        validity.invalidInputs.forEach(function(input) {
          var rect = input.getDOMNode().getBoundingClientRect();
          if (firstInput && rect.top > firstInputRect.top) return;
          if (firstInput && rect.top === firstInputRect.top &&
            rect.left > firstInputRect.left) return;
          firstInput = input;
          firstInputRect = rect;
        });
        firstInput.select();
      }).call(this);
      return;
    }
    if (this.props.onSubmit) this.props.onSubmit();
  },

  render: function() {
    return (
      React.DOM.form({
        role: 'form',
        onSubmit: this.handleSubmit,
        autoComplete: 'off',
        noValidate: true
      }, this.props.children)
    );
  }
});

module.exports = Form;
