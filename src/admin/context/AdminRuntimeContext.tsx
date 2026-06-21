import { createContext, useContext, type ReactNode } from 'react'
import { messageRows, semesterRows, tagRows, teacherRows, universityRows, userRows } from '../data'
import { useAdminEntityCollection } from '../hooks/useAdminEntityCollection'
import { useAdminOperationFeed } from '../hooks/useAdminOperationFeed'
import type {
  AdminOperationInput,
  AdminOperationLog,
  AdminOperationNotification,
  MessageAdminRow,
  SemesterAdminRow,
  TagAdminRow,
  TeacherAdminRow,
  UniversityAdminRow,
  UserAdminRow,
} from '../types/admin'

type AdminRuntimeValue = {
  notifications: AdminOperationNotification[]
  logs: AdminOperationLog[]
  messages: MessageAdminRow[]
  semesters: SemesterAdminRow[]
  tags: TagAdminRow[]
  teachers: TeacherAdminRow[]
  universities: UniversityAdminRow[]
  users: UserAdminRow[]
  createMessage: (message: MessageAdminRow) => void
  updateMessage: (messageId: string, updater: (current: MessageAdminRow) => MessageAdminRow) => void
  removeMessage: (messageId: string) => void
  createSemester: (semester: SemesterAdminRow) => void
  updateSemester: (semesterId: string, updater: (current: SemesterAdminRow) => SemesterAdminRow) => void
  removeSemester: (semesterId: string) => void
  createTag: (tag: TagAdminRow) => void
  updateTag: (tagId: string, updater: (current: TagAdminRow) => TagAdminRow) => void
  removeTag: (tagId: string) => void
  createTeacher: (teacher: TeacherAdminRow) => void
  updateTeacher: (teacherId: string, updater: (current: TeacherAdminRow) => TeacherAdminRow) => void
  removeTeacher: (teacherId: string) => void
  createUniversity: (university: UniversityAdminRow) => void
  updateUniversity: (universityId: string, updater: (current: UniversityAdminRow) => UniversityAdminRow) => void
  removeUniversity: (universityId: string) => void
  createUser: (user: UserAdminRow) => void
  updateUser: (userId: string, updater: (current: UserAdminRow) => UserAdminRow) => void
  removeUser: (userId: string) => void
  appendOperation: (operation: AdminOperationInput) => void
}

const AdminRuntimeContext = createContext<AdminRuntimeValue | null>(null)

export function AdminRuntimeProvider({ children }: { children: ReactNode }) {
  const operationFeed = useAdminOperationFeed()
  const messages = useAdminEntityCollection(messageRows)
  const semesters = useAdminEntityCollection(semesterRows)
  const tags = useAdminEntityCollection(tagRows)
  const teachers = useAdminEntityCollection(teacherRows)
  const universities = useAdminEntityCollection(universityRows)
  const users = useAdminEntityCollection(userRows)

  return (
    <AdminRuntimeContext.Provider
      value={{
        notifications: operationFeed.notifications,
        logs: operationFeed.logs,
        messages: messages.rows,
        semesters: semesters.rows,
        tags: tags.rows,
        teachers: teachers.rows,
        universities: universities.rows,
        users: users.rows,
        createMessage: messages.createEntity,
        updateMessage: messages.updateEntity,
        removeMessage: messages.removeEntity,
        createSemester: semesters.createEntity,
        updateSemester: semesters.updateEntity,
        removeSemester: semesters.removeEntity,
        createTag: tags.createEntity,
        updateTag: tags.updateEntity,
        removeTag: tags.removeEntity,
        createTeacher: teachers.createEntity,
        updateTeacher: teachers.updateEntity,
        removeTeacher: teachers.removeEntity,
        createUniversity: universities.createEntity,
        updateUniversity: universities.updateEntity,
        removeUniversity: universities.removeEntity,
        createUser: users.createEntity,
        updateUser: users.updateEntity,
        removeUser: users.removeEntity,
        appendOperation: operationFeed.appendOperation,
      }}
    >
      {children}
    </AdminRuntimeContext.Provider>
  )
}

export function useAdminRuntime() {
  const context = useContext(AdminRuntimeContext)

  if (!context) {
    throw new Error('AdminRuntimeProvider is missing')
  }

  return context
}
