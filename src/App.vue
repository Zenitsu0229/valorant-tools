<script setup>
import { ref } from 'vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'
import AppHeader      from './components/AppHeader.vue'
import AppFooter      from './components/AppFooter.vue'
import Agent5         from './pages/Agent5/Agent5.vue'
import Agent5v5       from './pages/Agent5v5/Agent5v5.vue'
import Map            from './pages/Map/Map.vue'
import TeamSplit      from './pages/TeamSplit/TeamSplit.vue'
import Contact        from './pages/Contact/Contact.vue'
import PrivacyPolicy  from './pages/Legal/PrivacyPolicy.vue'
import TermsOfService from './pages/Legal/TermsOfService.vue'
import CookiePolicy   from './pages/Legal/CookiePolicy.vue'
import './pages/Legal/Legal.css'

const tabs = [
  { key: 'agent5',     label: 'Random' },
  { key: 'agent5v5',   label: 'Custom' },
  { key: 'map',        label: 'Map' },
  { key: 'teamsplit',  label: 'Team' },
  { key: 'contact',    label: 'Contact' },
]

const activeTab  = ref('agent5')
const legalPage  = ref(null) // null | 'privacy' | 'terms' | 'cookie'

function openLegal(page) {
  legalPage.value = page
  activeTab.value = 'contact'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function closeLegal() {
  legalPage.value = null
}
</script>

<template>
  <AppHeader :tabs="tabs" :activeTab="activeTab" @update:activeTab="activeTab = $event" />

  <main>
    <template v-if="legalPage">
      <PrivacyPolicy
        v-if="legalPage === 'privacy'"
        @close="closeLegal"
        @changePage="openLegal"
      />
      <TermsOfService
        v-else-if="legalPage === 'terms'"
        @close="closeLegal"
      />
      <CookiePolicy
        v-else-if="legalPage === 'cookie'"
        @close="closeLegal"
      />
    </template>
    <template v-else>
      <Agent5   v-show="activeTab === 'agent5'" />
      <Agent5v5 v-show="activeTab === 'agent5v5'" />
      <Map       v-show="activeTab === 'map'" />
      <TeamSplit v-show="activeTab === 'teamsplit'" @go-custom="activeTab = 'agent5v5'" />
      <Contact   v-show="activeTab === 'contact'" />
    </template>
  </main>

  <AppFooter @showLegal="openLegal" />

  <SpeedInsights />
</template>
