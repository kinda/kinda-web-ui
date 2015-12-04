'use strict';

let _ = require('lodash');
let React = require('react');
let BS = require('react-bootstrap');
let ColorPicker = require('react-color');

let Input = {
  inject(ui) {
    return React.createClass({
      getDefaultProps() {
        return {
          colorPickerType: 'compact'
        };
      },

      getInitialState() {
        return {
          inputValue: undefined,
          isValid: undefined,
          displayColorPicker: false
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
          return ui.getLocaleValue('parseDate')(value, 'UTC');
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
          return ui.getLocaleValue('date')(value, 'UTC');
        } else if (this.props.type === 'array') {
          return value != null ? JSON.stringify(value, undefined, 2) : '';
        } else if (this.props.type === 'color') {
          return value || '';
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

      handleColorInputClick() {
        this.setState({ displayColorPicker: !this.state.displayColorPicker });
      },

      handleColorInputClose() {
        this.setState({ displayColorPicker: false });
      },

      handleColorInputChange(color) {
        let value = '#' + color.hex;
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
        if (this.props.type === 'color') return this.renderColorInput();

        let props = _.pick(this.props, [
          'id',
          'label',
          'required',
          'disabled',
          'readOnly',
          'placeholder',
          'autoFocus',
          'rows',
          'style',
          'addonBefore',
          'addonAfter',
          'buttonBefore',
          'buttonAfter'
        ]);
        props.type = this.getType();
        props.ref = 'input';
        props.bsStyle = this.getBSStyle();
        props.labelClassName = this.getLabelClassName();
        props.onChange = this.handleChange;
        if (this.props.type === 'checkbox') {
          props.checked = this.state.inputValue;
        } else {
          props.value = this.state.inputValue;
        }

        return <BS.Input {...props} />;
      },

      renderColorInput() {
        let props = _.pick(this.props, [
          'id',
          'label',
          'style'
        ]);
        props.bsStyle = this.getBSStyle();
        props.labelClassName = this.getLabelClassName();

        return (
          <BS.Input {...props}>
            <div style={{ width: '100%', padding: 5, background: '#fff', border: '1px solid #ccc', borderRadius: 4, display: 'inline-block', cursor: 'pointer' }} onClick={this.handleColorInputClick}>
              <div style={{ height: 21, borderRadius: 2, background: this.state.inputValue }} />
            </div>
            <ColorPicker
              color={this.state.inputValue}
              positionCSS={{ position: 'absolute', top: 63, left: -12 }}
              display={this.state.displayColorPicker}
              onChange={this.handleColorInputChange}
              onClose={this.handleColorInputClose}
              type={this.props.colorPickerType} />
          </BS.Input>
        );
      }
    });
  }
};

module.exports = Input;
