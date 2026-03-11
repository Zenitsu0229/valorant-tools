import { ref } from 'vue'

// モジュールスコープのシングルトン — コンポーネント間で共有
const pendingTeams = ref(null)
// 型: { a: string[], b: string[] } | null

export function useSharedTeam() {
  function setTeams(a, b) {
    pendingTeams.value = { a, b }
  }

  function consumeTeams() {
    const data = pendingTeams.value
    pendingTeams.value = null
    return data
  }

  return { pendingTeams, setTeams, consumeTeams }
}
