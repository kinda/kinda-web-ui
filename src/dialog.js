'use strict';

let React = require('react');
let BS = require('react-bootstrap');

let Dialog = {
  inject(ui) {
    return React.createClass({
      mixins: [ui.DialogCommon, BS.OverlayMixin],

      getDialogDOMNode() {
        return this.getOverlayDOMNode();
      },

      render() {
        return React.DOM.span(null);
      },

      renderOverlay() {
        if (!this.state.isOpen) return React.DOM.span(null);
        return (
          React.createElement(BS.Modal,
            {
              title: this.state.options.title,
              animation: this.state.options.animation,
              onRequestHide: this.onHide
            },
            React.DOM.div(
              { className: 'modal-body' },
              this.state.options.message ?
                React.DOM.div({ style: { whiteSpace: 'pre-line' } }, this.state.options.message) :
                false,
              this.state.options.content ? this.state.options.content : false,
              this.state.options.input ?
                React.DOM.div(
                  { className: 'form-group', style: { marginBottom: '2px' } },
                  React.DOM.label({ htmlFor: 'input' }, this.state.options.input.label),
                  React.DOM.input({
                    type: 'text',
                    className: 'form-control',
                    value: this.state.inputValue,
                    onChange: this.onChange,
                    onKeyPress: this.onKeyPress,
                    id: 'input'
                  })
                ) :
                false
            ),
            React.DOM.div(
              { className: 'modal-footer' },
              React.createElement(BS.ButtonToolbar, null,
                this.state.options.secondaryButton ?
                  React.createElement(BS.Button,
                    { onClick: this.onSecondaryButton },
                    this.state.options.secondaryButton.label
                  ) :
                  false,
                React.createElement(BS.Button,
                  { bsStyle: 'primary', onClick: this.onPrimaryButton },
                  this.state.options.primaryButton.label
                )
              )
            )
          )
        );
      }
    });
  }
};

module.exports = Dialog;
