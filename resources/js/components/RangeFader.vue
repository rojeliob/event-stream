<template>
  <div
    class="relative w-12 h-40 flex items-center justify-center bg-gray-900 rounded-lg border-2 border-gray-800"
  >
    <!-- Range input -->
    <input
      type="range"
      min="0"
      max="1000"
      v-model="value"
      @input="updateRotation"
      class="absolute bottom-0 w-full h-full opacity-0 cursor-pointer z-10 transform rotate-180"
    />

    <!-- Fader track -->
    <div
      class="absolute left-1/2 w-1.5 h-full bg-gray-700 transform -translate-x-1/2"
    ></div>

    <!-- Fader knob -->
    <div
      ref="dragElement"
      class="absolute bottom-0 w-10 h-4 bg-red-500 rounded-full shadow-md cursor-pointer"
      :style="{ transform: `translateY(-${value}%)` }"
      draggable="true"
      @dragstart="handleDragStart"
      @drag="handleDrag"
      @dragend="handleDragEnd"
    ></div>

    <!-- Labels -->
    <div
      class="absolute left-0 bottom-full transform -translate-x-1/2 translate-y-2 text-xs text-white"
    >
      100
    </div>
    <div
      class="absolute right-0 bottom-full transform translate-x-1/2 translate-y-2 text-xs text-white"
    >
      0
    </div>
  </div>
</template>
  
  <script setup>
import { ref } from "vue";

const value = ref(500);
const dragStartValue = ref(0);

const updateRotation = () => {
  // Update rotation logic if needed
};

const handleDragStart = (event) => {
  event.dataTransfer.setDragImage(document.createElement("span"), 0, 0);
  dragStartValue.value = value.value;
};

const handleDrag = (event) => {
  const rect = event.target.parentElement.getBoundingClientRect();
  const centerY = rect.top + rect.height;
  const mouseY = event.clientY;

  let newValue = 100 - ((mouseY - rect.top) / rect.height) * 100;
  if (newValue < 0) newValue = 0;
  if (newValue > 100) newValue = 100;

  value.value = newValue;
};

const handleDragEnd = () => {
  // Any cleanup after drag ends
};
</script>
  
  <style scoped>
.bg-red-500 {
  background-color: red;
}
</style>
  