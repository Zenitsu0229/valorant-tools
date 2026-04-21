import { createRouter, createWebHistory } from 'vue-router'

export const TAB_ROUTES = [
  { path: '/agent-roulette', tab: 'agent5'    },
  { path: '/custom',         tab: 'agent5v5'  },
  { path: '/map-roulette',   tab: 'map'       },
  { path: '/team',           tab: 'teamsplit' },
  { path: '/contact',        tab: 'contact'   },
]

const routes = [
  { path: '/', redirect: '/agent-roulette' },
  ...TAB_ROUTES.map(({ path, tab }) => ({ path, meta: { tab } })),
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
