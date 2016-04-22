import React from 'react';
import ReactDOM from 'react-dom';

import ApiMixin from '../mixins/apiMixin';

const AvatarSettings = React.createClass({
  propTypes: {
    userId: React.PropTypes.number
  },

  mixins: [ApiMixin],

  getInitialState() {
    return {
      error: null,
      moving: false,
      resizeDone: false,
      resizeDimensions: {
        top: 0,
        left: 0,
        width: 180,
        height: 180
      }
    };
  },

  onChange(ev) {
    let file = ev.target.files[0];
    if (!/^image\//.test(file.type)) {
      this.setState({error: 'That is not a supported file type.'});
      // TODO: remove file from input
      return;
    }
    this.state.objectURL && window.URL.revokeObjectURL(this.state.objectURL);
    this.setState({
      file: file,
      objectURL: window.URL.createObjectURL(file)
    });
  },

  componentWIllUnmount() {
    this.state.objectURL && window.URL.revokeObjectURL(this.state.objectURL);
  },

  updateDimensions(ev) {
    let $container = $(ReactDOM.findDOMNode(this.refs.cropContainer));
    let offset = $container.offset();
    let top = ev.pageY - offset.top;
    let left = ev.pageX - offset.left;
    this.setState({resizeDimensions: Object.assign({}, this.state.resizeDimensions, {top: top, left: left})});
  },

  startMove() {
    $(document).on('mousemove', this.updateDimensions);
    $(document).on('mouseup', this.onMouseUp);
  },

  stopMove() {
    $(document).off('mousemove', this.updateDimensions);
    $(document).off('mouseup', this.onMouseUp);
    this.drawToCanvas();
  },

  onMouseDown(ev) {
    ev.preventDefault();
    this.setState({moving: true});
    this.startMove();
  },

  onMouseUp(ev) {
    ev.preventDefault();
    this.setState({moving: false});
    this.stopMove();
  },

  getEndpoint() {
    return '/users/me/avatar/';
  },

  saveSuccess() {
    // TODO
  },

  saveFail() {
    // TODO
  },

  onLoad(ev) {
    let $img = $(this.refs.image);
    let dimension = Math.min($img.height(), $img.width());
    this.setState({
      resizeDimensions: Object.assign({}, this.state.resizeDimensions, {width: dimension, height: dimension})
    }, this.drawToCanvas);
  },

  drawToCanvas() {
    let canvas = $(ReactDOM.findDOMNode(this.refs.canvas))[0];
    let resizeDimensions = this.state.resizeDimensions;
    let img = ReactDOM.findDOMNode(this.refs.image);
    canvas.width = resizeDimensions.width;
    canvas.height = resizeDimensions.height;
    canvas.getContext('2d').drawImage(img,
                                      resizeDimensions.left,
                                      resizeDimensions.top,
                                      resizeDimensions.width,
                                      resizeDimensions.height,
                                      0, 0,
                                      resizeDimensions.width,
                                      resizeDimensions.height);
  },

  finishCrop() {
    let canvas = $(ReactDOM.findDOMNode(this.refs.canvas))[0];
    this.api.request(this.getEndpoint(), {
      method: 'POST',
      data: {avatar: canvas.toDataURL().split(',')[1]},
      success: this.saveSuccess,
      error: this.saveFail
    });
  },

  renderImageCrop() {
    return (
      <div className="image-cropper">
        <div className="crop-container" ref="cropContainer">
          {this.state.objectURL && <img className="preview" ref="image"
                                        src={this.state.objectURL} onLoad={this.onLoad}/>}
          <div style={Object.assign({position: 'absolute', border: '1px solid black'},
                      this.state.resizeDimensions)}
               onMouseUp={this.onMouseUp} onMouseDown={this.onMouseDown}/>
        </div>
      </div>
    );
  },

  renderDataImage() {
    return <img src={this.state.dataUrl}/>;
  },

  render() {
    return (
      <div>
        <input type="file" accept="image/*" onChange={this.onChange}/>
        {this.state.objectURL && this.renderImageCrop()}
        <canvas ref="canvas"></canvas>
        {this.state.objectURL && <div><button onClick={this.finishCrop}>Done</button></div>}
        {this.state.dataUrl && this.renderDataImage()}
      </div>
    );
  }
});

export default AvatarSettings;
