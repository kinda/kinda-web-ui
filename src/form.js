'use strict';

let _ = require('lodash');
let co = require('co');
let React = require('react');

let Form = {
  inject(ui) {
    return React.createClass({
      componentDidMount() {
        this.inputComponents = [];
        this.getDOMNode().addEventListener(
          'inputComponentDidMount', this.inputComponentDidMount
        );
        this.getDOMNode().addEventListener(
          'inputComponentWillUnmount', this.inputComponentWillUnmount
        );
      },

      componentWillUnmount() {
        this.inputComponents = undefined;
        this.getDOMNode().removeEventListener(
          'inputComponentDidMount', this.inputComponentDidMount
        );
        this.getDOMNode().removeEventListener(
          'inputComponentWillUnmount', this.inputComponentWillUnmount
        );
      },

      inputComponentDidMount(e) {
        this.inputComponents.push(e.detail.inputComponent);
      },

      inputComponentWillUnmount(e) {
        _.pull(this.inputComponents, e.detail.inputComponent);
      },

      checkValidity() {
        let invalidInputs = _.filter(this.inputComponents, input => {
          return !input.checkValidity().isValid;
        });
        return {
          isValid: invalidInputs.length === 0,
          invalidInputs
        };
      },

      handleSubmit(e) {
        e.preventDefault();
        let validity = this.checkValidity();
        if (!validity.isValid) {
          co(function *() {
            yield ui.alert(ui.getLocaleValue('missingOrInvalidInformationMessage'));
            let firstInput, firstInputRect;
            validity.invalidInputs.forEach(function(input) {
              let rect = input.getDOMNode().getBoundingClientRect();
              if (firstInput && rect.top > firstInputRect.top) return;
              if (firstInput && rect.top === firstInputRect.top &&
                rect.left > firstInputRect.left) return;
              firstInput = input;
              firstInputRect = rect;
            });
            firstInput.select();
          }).catch(function(err) {
            console.error(err.stack);
          });
          return;
        }
        if (this.props.onSubmit) this.props.onSubmit();
      },

      render() {
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
  }
};

module.exports = Form;
