import { create } from 'zustand'
import type { Project } from '@/types'

interface ProjectStore {
  projects: Project[]           // 내가 속한 프로젝트 목록
  currentProject: Project | null  // 지금 보고 있는 프로젝트
  isLoading: boolean

  // 함수들
  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  addProject: (project: Project) => void
  updateProject: (updated: Project) => void
  removeProject: (id: number) => void
  setLoading: (loading: boolean) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  // ── 초기값 ──────────────────────────────────────────
  projects: [],
  currentProject: null,
  isLoading: false,

  // ── 함수들 ───────────────────────────────────────────
  setProjects: (projects) => set({ projects }),

  setCurrentProject: (project) => set({ currentProject: project }),

  addProject: (project) =>
    // 기존 배열에 새 프로젝트를 추가
    // ...prev.projects → PHP의 array_merge 같은 것 (배열 펼치기)
    set((state) => ({ projects: [...state.projects, project] })),

  updateProject: (updated) =>
    // id가 일치하는 프로젝트만 교체, 나머지는 그대로
    set((state) => ({
      projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      // 현재 보고 있는 프로젝트가 수정된 것이면 그것도 업데이트
      currentProject:
        state.currentProject?.id === updated.id ? updated : state.currentProject,
    })),

  removeProject: (id) =>
    // 해당 id 제외하고 나머지만 남김
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    })),

  setLoading: (loading) => set({ isLoading: loading }),
}))
