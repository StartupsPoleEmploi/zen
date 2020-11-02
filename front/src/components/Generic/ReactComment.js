import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

class ReactComment extends Component {
    static propTypes = {
      text: PropTypes.string.isRequired,
      trim: PropTypes.bool,
    };

    static defaultProps = {
      trim: true,
    };

    componentDidMount() {
      const el = this.node;
      ReactDOM.unmountComponentAtNode(el);
      el.outerHTML = this.createComment();
    }

    setRef = (ref) => {
      this.node = ref;
    }

    createComment() {
      let { text } = this.props;

      if (this.props.trim) {
        text = text.trim();
      }

      return `<!-- ${text} -->`;
    }

    render() {
      return <div ref={this.setRef} />;
    }
}

export default ReactComment;
