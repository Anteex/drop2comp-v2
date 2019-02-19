import React from 'react';
import YouTube from 'react-youtube';

export default class VideoAbout extends React.Component {
  render() {
    const opts = {
      playerVars: { // https://developers.google.com/youtube/player_parameters
        showinfo: 0,
        modestbranding: 1,
        color: "white",
        rel: 0
      }
    };

    return (
      <YouTube
        videoId="rrENGFBDZ88"
        opts={opts}
        className="videoplayer"
      />
    );
  }

}
