import type {
  AdminStatusTone,
  CourseAdminRow,
  EnrollmentAdminRow,
  PaymentAdminRow,
  StudentNoteAdminRow,
  StudentRuntimeRow,
} from '../../types/admin'

type StudentStatusPresentation = {
  label: string
  tone: AdminStatusTone
}

type EnrollmentStatusPresentation = {
  label: string
  tone: AdminStatusTone
}

type PaymentStatusPresentation = {
  label: string
  tone: AdminStatusTone
}

export type StudentListRow = StudentRuntimeRow & {
  courseCount: number
  courseCountLabel: string
  courseSummary: string
  paymentSummary: string
  latestPaymentAt: string
  statusLabel: string
  statusTone: AdminStatusTone
  searchText: string
}

export type StudentEnrollmentView = EnrollmentAdminRow & {
  courseName: string
  courseCode: string
  statusLabel: string
  statusTone: AdminStatusTone
}

export type StudentPaymentView = PaymentAdminRow & {
  courseName: string
  courseCode: string
  amountLabel: string
  statusLabel: string
  statusTone: AdminStatusTone
}

export type StudentDetailModel = {
  student: StudentRuntimeRow
  courseCount: number
  statusLabel: string
  statusTone: AdminStatusTone
  totalPaidLabel: string
  enrollments: StudentEnrollmentView[]
  payments: StudentPaymentView[]
  notes: StudentNoteAdminRow[]
}

const studentStatusMap: Record<StudentRuntimeRow['status'], StudentStatusPresentation> = {
  active: { label: '学习中', tone: 'success' },
  inactive: { label: '未激活', tone: 'neutral' },
}

const enrollmentStatusMap: Record<EnrollmentAdminRow['status'], EnrollmentStatusPresentation> = {
  active: { label: '已开通', tone: 'success' },
  expired: { label: '已过期', tone: 'danger' },
  pending: { label: '待确认', tone: 'warning' },
}

const paymentStatusMap: Record<PaymentAdminRow['status'], PaymentStatusPresentation> = {
  paid: { label: '已支付', tone: 'success' },
  pending: { label: '待支付', tone: 'warning' },
  refunded: { label: '已退款', tone: 'neutral' },
}

function formatAud(amount: number) {
  return `AUD ${amount.toLocaleString('en-AU')}`
}

function getCourseLookup(courses: CourseAdminRow[]) {
  return new Map(courses.map((course) => [course.id, course]))
}

function comparePaidAtDesc(left: PaymentAdminRow, right: PaymentAdminRow) {
  return right.paidAt.localeCompare(left.paidAt)
}

export function getStudentStatusPresentation(status: StudentRuntimeRow['status']) {
  return studentStatusMap[status]
}

export function buildStudentListRows({
  students,
  enrollments,
  payments,
  courses,
}: {
  students: StudentRuntimeRow[]
  enrollments: EnrollmentAdminRow[]
  payments: PaymentAdminRow[]
  courses: CourseAdminRow[]
}) {
  const courseLookup = getCourseLookup(courses)

  return students.map((student) => {
    const studentEnrollments = enrollments.filter((item) => item.studentId === student.id)
    const studentPayments = payments.filter((item) => item.studentId === student.id)
    const paidPayments = studentPayments.filter((item) => item.status === 'paid')
    const latestPayment = [...studentPayments].sort(comparePaidAtDesc)[0]
    const totalPaid = paidPayments.reduce((sum, item) => sum + item.amount, 0)
    const courseSummaryItems = studentEnrollments
      .map((item) => {
        const course = courseLookup.get(item.courseId)
        return course ? `${course.code} ${course.name}` : item.courseId
      })
    const courseCount = courseSummaryItems.length
    const courseSummary = courseSummaryItems.join(' / ')
    const presentation = getStudentStatusPresentation(student.status)

    return {
      ...student,
      courseCount,
      courseCountLabel: `${courseCount} 门课程`,
      courseSummary: courseSummary || '暂无课程权限',
      paymentSummary: paidPayments.length > 0 ? `${paidPayments.length} 笔已支付 · ${formatAud(totalPaid)}` : '暂无缴费记录',
      latestPaymentAt: latestPayment?.paidAt ?? '暂无记录',
      statusLabel: presentation.label,
      statusTone: presentation.tone,
      searchText: [
        student.name,
        student.email,
        student.phone,
        courseSummary,
        presentation.label,
        paidPayments.length > 0 ? '已缴费' : '未缴费',
      ]
        .join(' ')
        .trim(),
    }
  })
}

export function buildStudentDetailModel({
  studentId,
  students,
  enrollments,
  payments,
  studentNotes,
  courses,
}: {
  studentId: string
  students: StudentRuntimeRow[]
  enrollments: EnrollmentAdminRow[]
  payments: PaymentAdminRow[]
  studentNotes: StudentNoteAdminRow[]
  courses: CourseAdminRow[]
}): StudentDetailModel | null {
  const student = students.find((item) => item.id === studentId)

  if (!student) {
    return null
  }

  const courseLookup = getCourseLookup(courses)
  const enrollmentViews = enrollments
    .filter((item) => item.studentId === student.id)
    .map((item) => {
      const course = courseLookup.get(item.courseId)
      const presentation = enrollmentStatusMap[item.status]

      return {
        ...item,
        courseName: course?.name ?? item.courseId,
        courseCode: course?.code ?? item.courseId,
        statusLabel: presentation.label,
        statusTone: presentation.tone,
      }
    })
  const paymentViews = payments
    .filter((item) => item.studentId === student.id)
    .map((item) => {
      const course = courseLookup.get(item.courseId)
      const presentation = paymentStatusMap[item.status]

      return {
        ...item,
        courseName: course?.name ?? item.courseId,
        courseCode: course?.code ?? item.courseId,
        amountLabel: formatAud(item.amount),
        statusLabel: presentation.label,
        statusTone: presentation.tone,
      }
    })
  const notes = [...studentNotes.filter((item) => item.studentId === student.id)].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  )
  const paidTotal = paymentViews.filter((item) => item.status === 'paid').reduce((sum, item) => sum + item.amount, 0)
  const presentation = getStudentStatusPresentation(student.status)

  return {
    student,
    courseCount: enrollmentViews.length,
    statusLabel: presentation.label,
    statusTone: presentation.tone,
    totalPaidLabel: paymentViews.length > 0 ? formatAud(paidTotal) : 'AUD 0',
    enrollments: enrollmentViews,
    payments: paymentViews,
    notes,
  }
}
