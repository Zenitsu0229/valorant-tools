<script setup>
defineProps({
  activeTab: String,
  tabs: Array,
})

defineEmits(['update:activeTab'])
</script>

<template>
  <div class="sticky-top">
    <header class="header">
      <div class="header__left">
        <div class="header__logo">VAL<span>//</span>RANDOM</div>
        <div class="header__subtitle">VALORANT ランダムピック</div>
      </div>
      <div class="header__right">
        <div class="header__badge">Beta 0.0.1</div>
      </div>
    </header>

    <nav class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === tab.key }"
        @click="$emit('update:activeTab', tab.key)"
      >{{ tab.label }}</button>
    </nav>
  </div>
</template>
