import { useState, useCallback } from "react"

const STORAGE_KEY = "habbip:custom_categories"
const PINNED_KEY = "habbip:pinned_categories"
const HIDDEN_BUILTIN_KEY = "habbip:hidden_builtins"
const HIDDEN_CUSTOM_CHIP_KEY = "habbip:hidden_custom_chips"
const MAX_CATEGORIES = 20
const MAX_PINNED = 4

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* empty */ }
}

export function useCustomCategories() {
  const [categories, setCategories] = useState(() => load(STORAGE_KEY, []))
  const [pinnedIds, setPinnedIds] = useState(() => load(PINNED_KEY, []))
  const [hiddenBuiltins, setHiddenBuiltins] = useState(() => load(HIDDEN_BUILTIN_KEY, []))
  const [hiddenCustomChipIds, setHiddenCustomChipIds] = useState(() => load(HIDDEN_CUSTOM_CHIP_KEY, []))

  // ── CRUD ────────────────────────────────────────────────────────────────
  const addCategory = useCallback((cat) => {
    setCategories((prev) => {
      if (prev.length >= MAX_CATEGORIES) return prev
      const next = [...prev, cat]
      save(STORAGE_KEY, next)
      return next
    })
  }, [])

  const removeCategory = useCallback((id) => {
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== id)
      save(STORAGE_KEY, next)
      return next
    })
    setPinnedIds((prev) => {
      const next = prev.filter((pid) => pid !== id)
      save(PINNED_KEY, next)
      return next
    })
  }, [])

  const updateCategory = useCallback((updatedCat) => {
    setCategories((prev) => {
      const next = prev.map((c) => (c.id === updatedCat.id ? updatedCat : c))
      save(STORAGE_KEY, next)
      return next
    })
  }, [])

  const addMobiToCategory = useCallback((categoryId, mobi) => {
    setCategories((prev) => {
      const next = prev.map((c) => {
        if (c.id !== categoryId) return c
        if (c.mobis?.some((m) => m.ClassName === mobi.ClassName)) return c
        const newMobis = [...(c.mobis || []), { ClassName: mobi.ClassName, FurniName: mobi.FurniName }]
        return {
          ...c,
          mobis: newMobis,
          exactClassNames: newMobis.map((m) => m.ClassName),
          searchTerms: [...new Set(newMobis.map((m) => m.ClassName.split("*")[0]))],
        }
      })
      save(STORAGE_KEY, next)
      return next
    })
  }, [])

  // ── PINNED ───────────────────────────────────────────────────────────────
  const pinCategory = useCallback((id) => {
    setPinnedIds((prev) => {
      if (prev.includes(id) || prev.length >= MAX_PINNED) return prev
      const next = [...prev, id]
      save(PINNED_KEY, next)
      return next
    })
  }, [])

  const unpinCategory = useCallback((id) => {
    setPinnedIds((prev) => {
      const next = prev.filter((pid) => pid !== id)
      save(PINNED_KEY, next)
      return next
    })
  }, [])

  // Reordena os pinned após drag & drop
  const reorderPinned = useCallback((fromIndex, toIndex) => {
    setPinnedIds((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      save(PINNED_KEY, next)
      return next
    })
  }, [])

  // ── BUILT-IN VISIBILITY ──────────────────────────────────────────────────
  const hideBuiltin = useCallback((id) => {
    setHiddenBuiltins((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      save(HIDDEN_BUILTIN_KEY, next)
      return next
    })
    setPinnedIds((prev) => {
      const next = prev.filter((pid) => pid !== id)
      save(PINNED_KEY, next)
      return next
    })
  }, [])

  const showBuiltin = useCallback((id) => {
    setHiddenBuiltins((prev) => {
      const next = prev.filter((hid) => hid !== id)
      save(HIDDEN_BUILTIN_KEY, next)
      return next
    })
  }, [])

  // ── CUSTOM CHIP VISIBILITY ───────────────────────────────────────────────
  const hideCustomFromChips = useCallback((id) => {
    setHiddenCustomChipIds((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      save(HIDDEN_CUSTOM_CHIP_KEY, next)
      return next
    })
    setPinnedIds((prev) => {
      const next = prev.filter((pid) => pid !== id)
      save(PINNED_KEY, next)
      return next
    })
  }, [])

  const showCustomInChips = useCallback((id) => {
    setHiddenCustomChipIds((prev) => {
      const next = prev.filter((hid) => hid !== id)
      save(HIDDEN_CUSTOM_CHIP_KEY, next)
      return next
    })
  }, [])

  return {
    categories, pinnedIds, hiddenBuiltins, hiddenCustomChipIds,
    addCategory, removeCategory, updateCategory, addMobiToCategory,
    pinCategory, unpinCategory, reorderPinned,
    hideBuiltin, showBuiltin,
    hideCustomFromChips, showCustomInChips,
    MAX_CATEGORIES, MAX_PINNED,
  }
}