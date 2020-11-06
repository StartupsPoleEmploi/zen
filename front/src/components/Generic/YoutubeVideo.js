import React from 'react';
import PropTypes from 'prop-types';
import ReactComment from './ReactComment';

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

export function YoutubeVideo({ id }) {
  return (
    <div style={{ ...style, ...shadowStyle }} id={id} tag="1001">
      <ReactComment text={`<iframe sandbox="allow-scripts allow-same-origin allow-presentation" 
      title="Vidéo de présentation du service Zen" 
      src="https://www.youtube.com/embed/lnOxn6yzMyw?autoplay=1&amp;rel=0" 
      frameborder="0" 
      allow="autoplay; encrypted-media" 
      allowfullscreen="" 
      style="width: 100%; height: 35rem;"></iframe>`}
      />
      {/* <iframe
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
      /> */}
    </div>
  );
}

YoutubeVideo.propTypes = {
  id: PropTypes.string.isRequired,
};

export default YoutubeVideo;
