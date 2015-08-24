'use strict';

let _ = require('lodash');
let React = require('react');
let BS = require('react-bootstrap');

let Input = {
  inject(ui) {
    return React.createClass({
      getInitialState() {
        return {
          inputValue: undefined,
          isValid: undefined
        };
      },

      componentWillMount() {
        this.setValue(this.props.value);
      },

      componentDidMount() {
        if (this.props.type === 'date') {
          let $input = $(this.getInputDOMNode());
          $input.datepicker({
            autoclose: true,
            keyboardNavigation: false,
            forceParse: false,
            language: ui.locale.code,
            format: ui.getLocaleValue('datePickerFormat')
          });
          $input.datepicker().on('changeDate', this.handleChange);
        }

        setTimeout(() => { // wait ancestors mounting
          let e = new CustomEvent('inputComponentDidMount', {
            detail: { inputComponent: this },
            bubbles: true
          });
          this.getDOMNode().dispatchEvent(e);
        }, 0);
      },

      componentWillUnmount() {
        if (this.props.type === 'date') {
          $(this.getInputDOMNode()).datepicker('remove');
        }

        let e = new CustomEvent('inputComponentWillUnmount', {
          detail: { inputComponent: this },
          bubbles: true
        });
        this.getDOMNode().dispatchEvent(e);
      },

      componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps.value, this.getValue())) {
          this.setValue(nextProps.value);
        }
      },

      getValue() {
        return this.parseValue(this.state.inputValue);
      },

      setValue(value) {
        this.setInputValue(this.formatValue(value), () => {
          if (this.props.type === 'date') {
            $(this.getInputDOMNode()).datepicker('update');
          }
        });
      },

      parseValue(value) {
        if (this.props.type === 'number') {
          return ui.getLocaleValue('parseNumber')(value);
        } else if (this.props.type === 'date') {
          return ui.getLocaleValue('parseDate')(value);
        } else if (this.props.type === 'array') {
          try {
            value = JSON.parse(value);
            if (!_.isArray(value)) value = undefined;
          } catch (err) {
            value = undefined;
          }
          return value;
        } else {
          return value;
        }
      },

      formatValue(value) {
        if (this.props.type === 'number') {
          return ui.getLocaleValue('number')(value);
        } else if (this.props.type === 'date') {
          return ui.getLocaleValue('date')(value);
        } else if (this.props.type === 'array') {
          return value != null ? JSON.stringify(value, undefined, 2) : '';
        } else {
          return value;
        }
      },

      checkValidity() {
        let isValid = true;
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
          this.setState({ isValid });
        }
        return { isValid };
      },

      setInputValue(value, fn) {
        if (value === this.state.inputValue) return;
        this.setState({ inputValue: value }, () => {
          if (this.state.isValid != null) this.checkValidity();
          if (fn) fn(this);
        });
      },

      handleChange() {
        let value;
        if (this.props.type === 'checkbox') {
          value = this.refs.input.getChecked();
        } else {
          value = this.refs.input.getValue();
        }
        this.setInputValue(value, this.props.onChange);
      },

      getInputDOMNode() {
        return this.refs.input.getInputDOMNode();
      },

      focus() {
        let node = this.getInputDOMNode();
        if (node.focus) node.focus();
      },

      select() {
        let node = this.getInputDOMNode();
        if (node.select) node.select();
        else if (node.focus) node.focus();
      },

      getType() {
        if (this.props.type === 'number') return 'text';
        else if (this.props.type === 'date') return 'text';
        else if (this.props.type === 'array') return 'textarea';
        else return this.props.type;
      },

      getBSStyle() {
        return this.state.isValid === false ? 'error' : undefined;
      },

      getLabelClassName() {
        let classes = [];
        if (this.props.labelClassName) classes.push(this.props.labelClassName);
        if (this.props.required) classes.push('required-indicator');
        return classes.join(' ');
      },

      render() {
        let props = {
          type: this.getType(),
          label: this.props.label,
          ref: 'input',
          required: this.props.required,
          disabled: this.props.disabled,
          readOnly: this.props.readOnly,
          placeholder: this.props.placeholder,
          autoFocus: this.props.autoFocus,
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
        if (this.props.type === 'checkbox') {
          props.checked = this.state.inputValue;
        } else {
          props.value = this.state.inputValue;
        }
        return React.createElement(BS.Input, props);
      }
    });
  }
};

module.exports = Input;
