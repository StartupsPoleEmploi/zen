import React, { Component } from 'react';
import styled from 'styled-components';

import PropTypes from 'prop-types';
import image from '../../images/youtube-video-thumb.jpg';
import player from '../../images/player.svg';

const Button = styled.button`
  border: none;
  margin: 0;
  padding: 0;
  cursor: pointer;
  background: none;
  display: block;
  position: relative;

  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  background-color: #fff;

  &::-moz-focus-inner {
    border: 0;
    padding: 0;
  }
`;

const style = {
  width: '62rem',
  maxWidth: '100%',
  maxHeight: '35rem',
  borderRadius: '5%',
  overflow: 'hidden',
};

const shadowStyle = {
  boxShadow: '0 0 1.5rem 0.5rem rgba(0, 0, 0, 0.05)',
};

export class YoutubeVideo extends Component {
  static propTypes = { id: PropTypes.string.isRequired }

  state = {
    showVideo: false,
  }

  showVideo = () => this.setState({ showVideo: true })

  render() {
    const title = 'Vidéo de présentation du service Zen';

    if (this.state.showVideo) {
      return (
        <div style={{ ...style, ...shadowStyle }} id={this.props.id}>
          <iframe
            sandbox="allow-scripts allow-same-origin allow-presentation"
            title={title}
            src="https://www.youtube.com/embed/lnOxn6yzMyw?autoplay=1&rel=0"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{
              width: '100%',
              height: '35rem',
            }}
          />
        </div>
      );
    }

    return (
      <Button
        type="button"
        title={`Visualiser : ${title}`}
        onClick={this.showVideo}
        style={{ ...style, ...shadowStyle }}
        id={this.props.id}
      >
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            top: 0,
            left: 0,
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
          }}
        >
          <img src={player} alt="" />
        </div>
        <img src={image} alt={title} style={style} />
      </Button>
    );
  }
}

export default YoutubeVideo;
