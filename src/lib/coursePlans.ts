import { useSyncExternalStore } from 'react'
import { courseCatalog } from '../data/courses'
import { savedCoursePlans, type SavedCoursePlan } from '../data/profile'

export type HydratedSavedCoursePlanItem = SavedCoursePlan['items'][number] & {
  code: string
  name: string
}

export type HydratedSavedCoursePlan = Omit<SavedCoursePlan, 'items'> & {
  items: HydratedSavedCoursePlanItem[]
}

type SavedCoursePlanStoreInput = Pick<SavedCoursePlan, 'title' | 'year' | 'term' | 'status' | 'items'>

const initialPlanStore = savedCoursePlans.map((plan) => ({
  ...plan,
  items: plan.items.map((item) => ({ ...item })),
}))

let planStore = initialPlanStore
let hydratedPlanStore = planStore.map(hydratePlan)

const listeners = new Set<() => void>()

function hydratePlan(plan: SavedCoursePlan): HydratedSavedCoursePlan {
  return {
    ...plan,
    items: plan.items.map((item) => {
      const course = courseCatalog.find((entry) => entry.id === item.universityCourseId)
      return {
        ...item,
        code: course?.code ?? item.universityCourseId,
        name: course?.name ?? '课程信息待补充',
      }
    }),
  }
}

function emitChange() {
  listeners.forEach((listener) => listener())
}

export function getSavedCoursePlans(): SavedCoursePlan[] {
  return planStore
}

export function getHydratedSavedCoursePlans(): HydratedSavedCoursePlan[] {
  return hydratedPlanStore
}

export function useSavedCoursePlans() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getHydratedSavedCoursePlans,
    getHydratedSavedCoursePlans,
  )
}

export function saveCoursePlan(input: SavedCoursePlanStoreInput): SavedCoursePlan {
  const nextPlan: SavedCoursePlan = {
    id: `plan-${input.year.toLowerCase()}-${input.term.toLowerCase()}-${Date.now()}`,
    ...input,
    items: input.items.map((item) => ({ ...item })),
  }

  planStore = [nextPlan, ...planStore]
  hydratedPlanStore = planStore.map(hydratePlan)
  emitChange()
  return nextPlan
}

export function resetSavedCoursePlans() {
  planStore = initialPlanStore.map((plan) => ({
    ...plan,
    items: plan.items.map((item) => ({ ...item })),
  }))
  hydratedPlanStore = planStore.map(hydratePlan)
  emitChange()
}
