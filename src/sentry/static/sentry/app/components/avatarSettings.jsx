import React from 'react';


const AvatarSettings = React.createClass({
  propTypes: {
    userId: React.PropTypes.number
  },

  getInitialState() {
    return {
      error: null
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

  render() {
    return (
      <div>
        <input type="file" accept="image/*" onChange={this.onChange}/>
        {this.state.objectURL && <img src={this.state.objectURL} />}
      </div>
    );
  }
});

export default AvatarSettings;
