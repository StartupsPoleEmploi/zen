import React, { Component } from 'react'
import styled from 'styled-components'

import image from '../../images/youtube-video-thumbnail.jpg'

const Button = styled.button`
  border: none;
  margin: 0;
  padding: 0;
  cursor: pointer;
  background: none;
  display: block;

  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  background-color: #fff;

  &::-moz-focus-inner {
    border: 0;
    padding: 0;
  }
`

const style = {
  width: '62rem',
  maxWidth: '100%',
  maxHeight: '35rem',
  borderRadius: '5%',
  overflow: 'hidden',
}

const shadowStyle = {
  boxShadow: '0 0 1.5rem 0.5rem rgba(0, 0, 0, 0.05)',
}

export class YoutubeVideo extends Component {
  state = {
    showVideo: false,
  }

  showVideo = () => this.setState({ showVideo: true })

  render() {
    const title = 'Vidéo de présentation du service Zen'

    if (this.state.showVideo) {
      return (
        <div style={{ ...style, ...shadowStyle }}>
          <iframe
            sandbox="allow-scripts allow-same-origin allow-presentation"
            title={title}
            src="https://www.youtube.com/embed/IjC1vgptPX0?autoplay=1"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{
              width: '100%',
              height: '35rem',
            }}
          />
        </div>
      )
    }

    return (
      <Button
        type="button"
        title={`Visualiser : ${title}`}
        onClick={this.showVideo}
        style={{ ...style, ...shadowStyle }}
      >
        <img src={image} alt={title} style={style} />
      </Button>
    )
  }
}

export default YoutubeVideo
