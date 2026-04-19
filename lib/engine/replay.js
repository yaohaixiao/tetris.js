const Replay = {
  recording: false,
  playing: false,
  frame: 0,
  data: [],
  cursor: 0,

  startRecord() {
    this.recording = true;
    this.data = [];
    this.frame = 0;
  },

  stopRecord() {
    this.recording = false;
  },

  startPlay() {
    this.playing = true;
    this.frame = 0;
  },

  stopPlay() {
    this.playing = false;
  },
};

export default Replay;
