<template>
  <div
    class="relative w-40 h-40 flex items-center justify-center rounded-full bg-gradient-to-r from-gray-700 to-gray-900 shadow-inner border-2 border-gray-800"
  >
    <input
      type="range"
      min="0"
      max="100"
      v-model="value"
      @input="updateRotation"
      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
    />
    <div
      ref="dragElement"
      class="absolute w-1 h-20 bg-red-500"
      :style="{ transform: `rotate(${rotation}deg) translateY(-50%)` }"
      draggable="true"
      @dragstart="handleDragStart"
      @drag="handleDrag"
      @dragend="handleDragEnd"
    ></div>
    <div class="absolute inset-0 flex items-center justify-center">
      <div
        class="w-12 h-12 bg-gray-800 rounded-full border-4 border-gray-600 shadow-md"
      ></div>
    </div>
    <div
      class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 text-xs"
    >
      100
    </div>
    <div
      class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 text-xs"
    >
      0
    </div>
    <!-- <div
      class="absolute left-0 top-1/2 transform -translate-x-6 -translate-y-1/2 text-xs"
    >
      Min
    </div>
    <div
      class="absolute right-0 top-1/2 transform translate-x-6 -translate-y-1/2 text-xs"
    >
      Max
    </div> -->
    <!-- <div
      v-for="num in 11"
      :key="num"
      :style="tickStyle(num)"
      class="absolute text-xs"
    >
      {{ (num - 1) * 10 }}
    </div> -->
  </div>
</template>

<script setup>
import { ref } from "vue";

const value = ref(0);
const rotation = ref(0);
const dragStartAngle = ref(0);
const dragStartValue = ref(0);

const updateRotation = () => {
  rotation.value = (value.value / 100) * 270 - 135;
  console.log(`rotation value: ${rotation.value}`);

  console.log(`Range value: ${value.value}`);
};

const handleDragStart = (event) => {
  event.dataTransfer.setDragImage(document.createElement("span"), 0, 0);
  const rect = event.target.parentElement.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  dragStartAngle.value =
    Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI) - 90;
  dragStartValue.value = value.value;
};

const handleDrag = (event) => {
  const rect = event.target.parentElement.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  const angle =
    Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI) - 90;
  const delta = angle - dragStartAngle.value;

  let newValue = dragStartValue.value + (delta / 270) * 100;
  if (newValue < 0) newValue = 0;
  if (newValue > 100) newValue = 100;

  value.value = newValue;
  updateRotation();
};

const handleDragEnd = () => {
  // Any cleanup after drag ends
};

const tickStyle = (num) => {
  const angle = (num - 1) * 27 - 135;
  return {
    transform: `rotate(${angle}deg) translateX(-50%) translateY(-50%) translateX(${
      20 + 35
    }px) rotate(-${angle}deg)`,
    left: "50%",
    top: "50%",
  };
};

updateRotation();
</script>

<style scoped>
.bg-red-500 {
  background-color: red;
}
</style>
