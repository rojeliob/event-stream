<template>
  <div class="p-4">
    <div v-if="mediaAccessError" class="error-message text-red-500 font-bold">
      {{ mediaAccessError }}
    </div>
    <div v-else class="space-y-4">
      <div class="video-container flex space-x-4">
        <video
          ref="localVideo"
          class="w-1/2 border rounded"
          autoplay
          playsinline
          muted
        ></video>
        <video
          ref="remoteVideo"
          class="w-1/2 border rounded"
          autoplay
          playsinline
        ></video>
      </div>
      <div class="controls flex flex-col space-y-2">
        <div class="flex space-x-2">
          <button
            @click="toggleMuteMic"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            {{ isMicMuted ? "Unmute Mic" : "Mute Mic" }}
          </button>
          <button
            @click="toggleCamera"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            {{ isCameraOff ? "Turn Camera On" : "Turn Camera Off" }}
          </button>
        </div>
        <div class="flex space-x-2 items-center">
          <label for="audioInputSelect" class="w-1/3"
            >Select Audio Input:</label
          >
          <select
            id="audioInputSelect"
            v-model="selectedAudioInput"
            @change="changeAudioInput"
            class="px-4 py-2 border rounded"
          >
            <option
              v-for="device in audioInputDevices"
              :key="device.deviceId"
              :value="device.deviceId"
            >
              {{ device.label }}
            </option>
          </select>
        </div>
        <div class="flex space-x-2 items-center">
          <label for="volumeControl" class="w-1/3">Volume Control:</label>
          <input
            type="range"
            id="volumeControl"
            min="0"
            max="100"
            v-model="volume"
            @input="adjustVolume"
            class="w-full"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Peer from "simple-peer";
import Echo from "laravel-echo";

export default {
  name: "VideoCall",
  data() {
    return {
      peer: null,
      mediaAccessError: null,
      echo: null,
      localStream: null,
      isMicMuted: false,
      isCameraOff: false,
      audioInputDevices: [],
      selectedAudioInput: "",
      volume: 100,
    };
  },
  mounted() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.mediaAccessError = "getUserMedia is not supported or available";
      return;
    }

    this.$nextTick(() => {
      this.initializePeer();
      this.setupEchoListeners();
      this.enumerateDevices();
    });
  },
  methods: {
    initializePeer() {
      if (this.peer) {
        this.peer.destroy();
      }

      this.peer = new Peer({ initiator: true, trickle: false });

      this.peer.on("error", (err) => {
        console.error("Peer error:", err);
      });

      this.peer.on("close", () => {
        console.log("Peer connection closed");
        this.peer = null;
      });

      this.getUserMedia();
    },
    getUserMedia() {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: {
            deviceId: this.selectedAudioInput
              ? { exact: this.selectedAudioInput }
              : undefined,
          },
        })
        .then((stream) => {
          this.localStream = stream;
          const localVideo = this.$refs.localVideo;
          if (localVideo) {
            localVideo.srcObject = stream;
          } else {
            console.error("Local video element not found");
          }

          if (this.peer && !this.peer.destroyed) {
            this.peer.addStream(stream);

            this.peer.on("signal", (data) => {
              console.log("Generated SDP offer:", data);
              axios
                .post("/send-signal", { signal: data })
                .then((response) => {
                  console.log("Signal sent successfully:", response.data);
                })
                .catch((error) => {
                  console.error("Error sending signal:", error);
                });
            });

            this.peer.on("stream", (remoteStream) => {
              console.log("Received remote stream:", remoteStream);
              const remoteVideo = this.$refs.remoteVideo;
              if (remoteVideo) {
                remoteVideo.srcObject = remoteStream;
              } else {
                console.error("Remote video element not found");
              }
            });
          } else {
            console.error("Peer connection is destroyed before adding stream");
          }
        })
        .catch((error) => {
          console.error("Error accessing media devices:", error);
          this.mediaAccessError =
            "Error accessing media devices: " + error.message;
        });
    },
    setupEchoListeners() {
      // Initialize Echo instance
      this.echo = new Echo({
        broadcaster: "pusher",
        key: "7737bd5a6d3b2cf792ae",
        cluster: "sa1",
        encrypted: true,
        forceTLS: true,
      });

      this.echo.channel("video-call").listen("VideoCallSignal", (e) => {
        console.log("Received SDP answer:", e.signal);
        this.connectToPeer(e.signal);
      });
    },
    connectToPeer(remoteSignal) {
      try {
        if (this.peer && this.peer.destroyed) {
          console.error("Peer is destroyed, reinitializing peer");
          this.initializePeer();
        }
        if (this.peer) {
          console.log("Connecting to peer with signal:", remoteSignal);
          this.peer.signal(remoteSignal);
        } else {
          console.error("Peer is not initialized");
        }
      } catch (error) {
        console.error("Error connecting to peer:", error);
      }
    },
    toggleMuteMic() {
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach((track) => {
          track.enabled = !track.enabled;
          this.isMicMuted = !track.enabled;
        });
      }
    },
    toggleCamera() {
      if (this.localStream) {
        this.localStream.getVideoTracks().forEach((track) => {
          track.enabled = !track.enabled;
          this.isCameraOff = !track.enabled;
        });
      }
    },
    enumerateDevices() {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          this.audioInputDevices = devices.filter(
            (device) => device.kind === "audioinput"
          );
          if (this.audioInputDevices.length > 0) {
            this.selectedAudioInput = this.audioInputDevices[0].deviceId;
          }
        })
        .catch((error) => {
          console.error("Error enumerating devices:", error);
        });
    },
    changeAudioInput() {
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach((track) => {
          track.stop();
        });
      }
      this.getUserMedia();
    },
    adjustVolume() {
      const localVideo = this.$refs.localVideo;
      if (localVideo && localVideo.srcObject) {
        localVideo.srcObject.getAudioTracks().forEach((track) => {
          track.applyConstraints({ volume: this.volume / 100 });
        });
      }
    },
  },
};
</script>

<style scoped>
.error-message {
  @apply text-red-500 font-bold;
}
.video-container {
  @apply flex space-x-4;
}
video {
  @apply w-1/2 border rounded;
}
.controls {
  @apply flex flex-col space-y-2;
}
button {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700;
}
select,
input {
  @apply px-4 py-2 border rounded;
}
label {
  @apply w-1/3;
}
</style>
