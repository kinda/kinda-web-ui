'use strict';

let React = require('react');
let BS = require('react-bootstrap');

let Dialog = {
  inject(ui) {
    return React.createClass({
      mixins: [ui.DialogCommon],

      getDialogDOMNode() {
        return this.refs.portal.getOverlayDOMNode();
      },

      render() {
        return (
          <BS.Portal ref='portal' container={this}>
            {this.renderOverlay()}
          </BS.Portal>
        );
      },

      renderOverlay() {
        if (!this.state.isOpen) return false;
        return (
          <BS.Modal id={this.state.options.id} animation={this.state.options.animation} onHide={this.onHide}>
            <BS.Modal.Header closeButton>
              <BS.Modal.Title>{this.state.options.title}</BS.Modal.Title>
            </BS.Modal.Header>
            <BS.Modal.Body>
              {
                this.state.options.message ?
                <div style={{ whiteSpace: 'pre-line' }}>
                  {this.state.options.message}
                </div> :
                false
              }
              {
                this.state.options.content ?
                this.state.options.content :
                false
              }
              {
                this.state.options.input ?
                <div className='form-group' style={{ marginBottom: '2px' }}>
                  <label htmlFor='input'>
                    {this.state.options.input.label}
                  </label>
                  <input type='text' className='form-control' value={this.state.inputValue} onChange={this.onChange} onKeyPress={this.onKeyPress} id='input' />
                </div> :
                false
              }
            </BS.Modal.Body>
            <BS.Modal.Footer>
              <BS.ButtonToolbar>
                {
                  this.state.options.secondaryButton ?
                  <BS.Button id='dialog-secondary-button' onClick={this.onSecondaryButton}>
                    {this.state.options.secondaryButton.label}
                  </BS.Button> :
                  false
                }
                <BS.Button id='dialog-primary-button' bsStyle='primary' onClick={this.onPrimaryButton}>
                  {this.state.options.primaryButton.label}
                </BS.Button>
              </BS.ButtonToolbar>
            </BS.Modal.Footer>
          </BS.Modal>
        );
      }
    });
  }
};

module.exports = Dialog;
