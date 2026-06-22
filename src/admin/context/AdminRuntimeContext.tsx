import { createContext, useContext, useMemo, type ReactNode } from 'react'
import {
  classGroupRows,
  courseRows,
  enrollmentRows,
  examPaperRows,
  examProblemRows,
  messageRows,
  paymentRows,
  problemAssetRows,
  problemRows,
  problemTagRows,
  semesterRows,
  studentNoteRows,
  studentRows,
  tagRows,
  teacherRows,
  universityRows,
  userRows,
} from '../data'
import { useAdminEntityCollection } from '../hooks/useAdminEntityCollection'
import { useAdminOperationFeed } from '../hooks/useAdminOperationFeed'
import type {
  AdminOperationInput,
  AdminOperationLog,
  AdminOperationNotification,
  ClassGroupAdminRow,
  CourseAdminRow,
  EnrollmentAdminRow,
  ExamPaperAdminRow,
  ExamProblemAdminRow,
  MessageAdminRow,
  PaymentAdminRow,
  ProblemAdminRow,
  ProblemAssetAdminRow,
  ProblemTagAdminRow,
  SemesterAdminRow,
  StudentAdminRow,
  StudentRuntimeRow,
  StudentNoteAdminRow,
  TagAdminRow,
  TeacherAdminRow,
  UniversityAdminRow,
  UserAdminRow,
} from '../types/admin'

type AdminRuntimeValue = {
  notifications: AdminOperationNotification[]
  logs: AdminOperationLog[]
  courses: CourseAdminRow[]
  messages: MessageAdminRow[]
  semesters: SemesterAdminRow[]
  students: StudentRuntimeRow[]
  enrollments: EnrollmentAdminRow[]
  payments: PaymentAdminRow[]
  studentNotes: StudentNoteAdminRow[]
  classGroups: ClassGroupAdminRow[]
  problems: ProblemAdminRow[]
  problemTags: ProblemTagAdminRow[]
  examPapers: ExamPaperAdminRow[]
  examProblems: ExamProblemAdminRow[]
  problemAssets: ProblemAssetAdminRow[]
  tags: TagAdminRow[]
  teachers: TeacherAdminRow[]
  universities: UniversityAdminRow[]
  users: UserAdminRow[]
  createCourse: (course: CourseAdminRow) => void
  updateCourse: (courseId: string, updater: (current: CourseAdminRow) => CourseAdminRow) => void
  removeCourse: (courseId: string) => void
  createMessage: (message: MessageAdminRow) => void
  updateMessage: (messageId: string, updater: (current: MessageAdminRow) => MessageAdminRow) => void
  removeMessage: (messageId: string) => void
  createSemester: (semester: SemesterAdminRow) => void
  updateSemester: (semesterId: string, updater: (current: SemesterAdminRow) => SemesterAdminRow) => void
  removeSemester: (semesterId: string) => void
  createStudent: (student: StudentAdminRow) => void
  updateStudent: (studentId: string, updater: (current: StudentAdminRow) => StudentAdminRow) => void
  removeStudent: (studentId: string) => void
  createEnrollment: (enrollment: EnrollmentAdminRow) => void
  updateEnrollment: (enrollmentId: string, updater: (current: EnrollmentAdminRow) => EnrollmentAdminRow) => void
  removeEnrollment: (enrollmentId: string) => void
  createPayment: (payment: PaymentAdminRow) => void
  updatePayment: (paymentId: string, updater: (current: PaymentAdminRow) => PaymentAdminRow) => void
  removePayment: (paymentId: string) => void
  createStudentNote: (note: StudentNoteAdminRow) => void
  updateStudentNote: (noteId: string, updater: (current: StudentNoteAdminRow) => StudentNoteAdminRow) => void
  removeStudentNote: (noteId: string) => void
  createClassGroup: (group: ClassGroupAdminRow) => void
  updateClassGroup: (groupId: string, updater: (current: ClassGroupAdminRow) => ClassGroupAdminRow) => void
  removeClassGroup: (groupId: string) => void
  createProblem: (problem: ProblemAdminRow) => void
  updateProblem: (problemId: string, updater: (current: ProblemAdminRow) => ProblemAdminRow) => void
  removeProblem: (problemId: string) => void
  createProblemTag: (tag: ProblemTagAdminRow) => void
  updateProblemTag: (tagId: string, updater: (current: ProblemTagAdminRow) => ProblemTagAdminRow) => void
  removeProblemTag: (tagId: string) => void
  createExamPaper: (paper: ExamPaperAdminRow) => void
  updateExamPaper: (paperId: string, updater: (current: ExamPaperAdminRow) => ExamPaperAdminRow) => void
  removeExamPaper: (paperId: string) => void
  createExamProblem: (examProblem: ExamProblemAdminRow) => void
  updateExamProblem: (examProblemId: string, updater: (current: ExamProblemAdminRow) => ExamProblemAdminRow) => void
  removeExamProblem: (examProblemId: string) => void
  createProblemAsset: (asset: ProblemAssetAdminRow) => void
  updateProblemAsset: (assetId: string, updater: (current: ProblemAssetAdminRow) => ProblemAssetAdminRow) => void
  removeProblemAsset: (assetId: string) => void
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
  const courses = useAdminEntityCollection(courseRows)
  const messages = useAdminEntityCollection(messageRows)
  const semesters = useAdminEntityCollection(semesterRows)
  const students = useAdminEntityCollection(studentRows)
  const enrollments = useAdminEntityCollection(enrollmentRows)
  const payments = useAdminEntityCollection(paymentRows)
  const studentNotes = useAdminEntityCollection(studentNoteRows)
  const classGroups = useAdminEntityCollection(classGroupRows)
  const problems = useAdminEntityCollection(problemRows)
  const problemTags = useAdminEntityCollection(problemTagRows)
  const examPapers = useAdminEntityCollection(examPaperRows)
  const examProblems = useAdminEntityCollection(examProblemRows)
  const problemAssets = useAdminEntityCollection(problemAssetRows)
  const tags = useAdminEntityCollection(tagRows)
  const teachers = useAdminEntityCollection(teacherRows)
  const universities = useAdminEntityCollection(universityRows)
  const users = useAdminEntityCollection(userRows)
  const studentRuntimeRows = useMemo(
    () =>
      students.rows.map((student) => ({
        ...student,
        enrolledCourseCount: enrollments.rows.filter((enrollment) => enrollment.studentId === student.id).length,
      })),
    [enrollments.rows, students.rows],
  )

  return (
    <AdminRuntimeContext.Provider
      value={{
        notifications: operationFeed.notifications,
        logs: operationFeed.logs,
        courses: courses.rows,
        messages: messages.rows,
        semesters: semesters.rows,
        students: studentRuntimeRows,
        enrollments: enrollments.rows,
        payments: payments.rows,
        studentNotes: studentNotes.rows,
        classGroups: classGroups.rows,
        problems: problems.rows,
        problemTags: problemTags.rows,
        examPapers: examPapers.rows,
        examProblems: examProblems.rows,
        problemAssets: problemAssets.rows,
        tags: tags.rows,
        teachers: teachers.rows,
        universities: universities.rows,
        users: users.rows,
        createCourse: courses.createEntity,
        updateCourse: courses.updateEntity,
        removeCourse: courses.removeEntity,
        createMessage: messages.createEntity,
        updateMessage: messages.updateEntity,
        removeMessage: messages.removeEntity,
        createSemester: semesters.createEntity,
        updateSemester: semesters.updateEntity,
        removeSemester: semesters.removeEntity,
        createStudent: students.createEntity,
        updateStudent: students.updateEntity,
        removeStudent: students.removeEntity,
        createEnrollment: enrollments.createEntity,
        updateEnrollment: enrollments.updateEntity,
        removeEnrollment: enrollments.removeEntity,
        createPayment: payments.createEntity,
        updatePayment: payments.updateEntity,
        removePayment: payments.removeEntity,
        createStudentNote: studentNotes.createEntity,
        updateStudentNote: studentNotes.updateEntity,
        removeStudentNote: studentNotes.removeEntity,
        createClassGroup: classGroups.createEntity,
        updateClassGroup: classGroups.updateEntity,
        removeClassGroup: classGroups.removeEntity,
        createProblem: problems.createEntity,
        updateProblem: problems.updateEntity,
        removeProblem: problems.removeEntity,
        createProblemTag: problemTags.createEntity,
        updateProblemTag: problemTags.updateEntity,
        removeProblemTag: problemTags.removeEntity,
        createExamPaper: examPapers.createEntity,
        updateExamPaper: examPapers.updateEntity,
        removeExamPaper: examPapers.removeEntity,
        createExamProblem: examProblems.createEntity,
        updateExamProblem: examProblems.updateEntity,
        removeExamProblem: examProblems.removeEntity,
        createProblemAsset: problemAssets.createEntity,
        updateProblemAsset: problemAssets.updateEntity,
        removeProblemAsset: problemAssets.removeEntity,
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
