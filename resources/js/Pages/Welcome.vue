
<template>
  <div>
    <h1>{{ message }}</h1>
  </div>
</template>
  
  <script>
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      message: "Hello from Vue!",
    };
  },
});
</script>
  