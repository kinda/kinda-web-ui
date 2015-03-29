"use strict";

var _ = require('lodash');
var React = require('react');
var BS = require('react-bootstrap');
var util = require('kinda-util').create();
var tr = require('kinda-translator').create();

var Input = React.createClass({
  getInitialState: function() {
    return {
      inputValue: undefined,
      isValid: undefined
    };
  },

  componentWillMount: function() {
    this.setValue(this.props.value);
  },

  componentDidMount: function() {
    if (this.props.type === 'date') {
      var $input = $(this.getInputDOMNode());
      $input.datepicker({
        autoclose: true,
        keyboardNavigation: false,
        forceParse: false,
        language: tr.getCurrentLocaleId(),
        format: tr('kinda-ui.datePickerFormat')
      });
      $input.datepicker().on('changeDate', this.handleChange);
    }

    setTimeout(function () { // wait ancestors mounting
      var e = new CustomEvent("inputComponentDidMount", {
        detail: { inputComponent: this },
        bubbles: true
      });
      this.getDOMNode().dispatchEvent(e);
    }.bind(this), 0);
  },

  componentWillUnmount: function() {
    if (this.props.type === 'date')
      $(this.getInputDOMNode()).datepicker('remove');

    var e = new CustomEvent("inputComponentWillUnmount", {
      detail: { inputComponent: this },
      bubbles: true
    });
    this.getDOMNode().dispatchEvent(e);
  },

  componentWillReceiveProps: function(nextProps) {
    if (!_.isEqual(nextProps.value, this.getValue()))
      this.setValue(nextProps.value);
  },

  getValue: function() {
    return this.parseValue(this.state.inputValue);
  },

  setValue: function(value) {
    this.setInputValue(this.formatValue(value), function() {
      if (this.props.type === 'date')
        $(this.getInputDOMNode()).datepicker('update');
    }.bind(this));
  },

  parseValue: function(value) {
    if (this.props.type === 'number')
      return util.parseNumber(value);
    else if (this.props.type === 'date')
      return util.parseDate(value);
    else if (this.props.type === 'array') {
      try {
        value = JSON.parse(value);
        if (!_.isArray(value)) value = undefined
      } catch (err) {
        value = undefined;
      }
      return value;
    } else
      return value;
  },

  formatValue: function(value) {
    if (this.props.type === 'number')
      return util.formatNumber(value);
    else if (this.props.type === 'date')
      return util.formatDate(value);
    else if (this.props.type === 'array')
      return value != null ? JSON.stringify(value, undefined, 2) : '';
    else
      return value;
  },

  checkValidity: function() {
    var isValid = true;
    if (this.props.required) {
      isValid = !!this.getValue();
    }
    if (this.props.type === 'email') {
      isValid = /^.+@.+$/.test(this.getValue());
    } else if (this.props.type === 'array') {
      if (!this.getValue() && this.state.inputValue) {
        isValid = false;
      }
    }
    if (isValid !== this.state.isValid) {
      this.setState({ isValid: isValid });
    }
    return { isValid: isValid };
  },

  setInputValue: function(value, fn) {
    if (value === this.state.inputValue) return;
    this.setState({ inputValue: value }, function() {
      if (this.state.isValid != null) this.checkValidity();
      if (fn) fn(this);
    }.bind(this));
  },

  handleChange: function() {
    var value;
    if (this.props.type === 'checkbox')
      value = this.refs.input.getChecked();
    else
      value = this.refs.input.getValue();
    this.setInputValue(value, this.props.onChange);
  },

  getInputDOMNode: function() {
    return this.refs.input.getInputDOMNode();
  },

  focus: function() {
    var node = this.getInputDOMNode();
    node.focus && node.focus();
  },

  select: function() {
    var node = this.getInputDOMNode();
    node.select && node.select() || node.focus && node.focus();
  },

  getType: function() {
    if (this.props.type === 'number')
      return 'text';
    else if (this.props.type === 'date')
      return 'text';
    else if (this.props.type === 'array')
      return 'textarea';
    else
      return this.props.type;
  },

  getBSStyle: function() {
    return this.state.isValid === false ? 'error' : undefined;
  },

  getLabelClassName: function() {
    var classes = [];
    if (this.props.labelClassName) classes.push(this.props.labelClassName);
    if (this.props.required) classes.push('required-indicator');
    return classes.join(' ');
  },

  render: function() {
    var props = {
      type: this.getType(),
      label: this.props.label,
      ref: 'input',
      required: this.props.required,
      disabled: this.props.disabled,
      readOnly: this.props.readOnly,
      placeholder: this.props.placeholder,
      rows: this.props.rows,
      style: this.props.style,
      bsStyle: this.getBSStyle(),
      labelClassName: this.getLabelClassName(),
      addonBefore: this.props.addonBefore,
      addonAfter: this.props.addonAfter,
      buttonBefore: this.props.buttonBefore,
      buttonAfter: this.props.buttonAfter,
      onChange: this.handleChange
    };
    if (this.props.type === 'checkbox')
      props.checked = this.state.inputValue;
    else
      props.value = this.state.inputValue;
    return React.createElement(BS.Input, props);
  }
});

module.exports = Input;
