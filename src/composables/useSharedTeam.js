import { ref } from 'vue'

/**
 * TeamSplit → Agent5v5 へプレイヤー名を一時的に渡すための共有状態
 *
 * モジュールスコープのシングルトンとして定義することで、
 * どのコンポーネントからでも同じ pendingTeams を参照・更新できる。
 *
 * 使い方:
 *   - TeamSplit で setTeams(a, b) を呼んでデータをセット
 *   - Agent5v5 で consumeTeams() を呼んでデータを取得（取得後は null にリセット）
 */

// 共有データ本体 — { a: string[], b: string[] } | null
const pendingTeams = ref(null)

export function useSharedTeam() {
  // チーム A・B のプレイヤー名配列をセットする
  function setTeams(a, b) {
    pendingTeams.value = { a, b }
  }

  // データを取得して null にリセットする（1 回だけ消費できる）
  function consumeTeams() {
    const data = pendingTeams.value
    pendingTeams.value = null
    return data
  }

  return { pendingTeams, setTeams, consumeTeams }
}
