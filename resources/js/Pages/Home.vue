<template>
  <div>
    <video-call></video-call>
  </div>
</template>
  
  <script>
import VideoCall from "../components/VideoCall.vue"; // Adjust the path if necessary

export default {
  name: "Home",
  components: {
    VideoCall,
  },
};
</script>