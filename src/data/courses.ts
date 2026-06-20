import { universityCourses } from '../domain/mockData'
import type { UniversityCourse } from '../domain/types'

export type CourseRatingBreakdown = {
  difficulty: number
  homework: number
  grading: number
  harvest: number
}

export type CourseCreditUnitLabel = 'UOC' | 'CP'

export type CourseCatalogMeta = {
  tags: string[]
  description: string
  lecturer: string
  tutors: string[]
  credits: number
  prerequisiteCodes: string[]
  ratingBreakdown: CourseRatingBreakdown
}

export type CourseCatalogEntry = UniversityCourse & CourseCatalogMeta

type CourseCatalogSeed = CourseCatalogMeta

export const schoolLabels: Record<string, string> = {
  sch_unsw: 'UNSW',
  sch_usyd: 'USYD',
  sch_unimelb: 'UniMelb',
}

export const featuredUniversityCourseIds = ['uc_9021', 'uc_9311', 'uc_9101']

const courseCatalogSeedById: Record<string, CourseCatalogSeed> = {
  uc_9021: {
    tags: ['较友好', '作业多', '干货满满'],
    description: '课程内容扎实，强调编程基础、问题拆解与代码表达能力，适合作为后续计算机课程的能力底座。',
    lecturer: 'Eric Martin',
    tutors: ['Alice', 'Ben'],
    credits: 6,
    prerequisiteCodes: ['COMP1511'],
    ratingBreakdown: { difficulty: 2.5, homework: 4.0, grading: 3.2, harvest: 4.7 },
  },
  uc_9311: {
    tags: ['项目实用', 'SQL 强化', '考试常规'],
    description: '系统讲解关系数据库、SQL、模式设计与查询优化，和工程实践结合紧密。',
    lecturer: 'Wei Liu',
    tutors: ['Karen', 'Leo'],
    credits: 6,
    prerequisiteCodes: ['COMP9021'],
    ratingBreakdown: { difficulty: 3.4, homework: 3.7, grading: 3.5, harvest: 4.6 },
  },
  uc_9101: {
    tags: ['数学要求高', '含金量高', '作业硬核'],
    description: '覆盖算法分析、证明与复杂度，理论与应用并重，适合希望提升算法能力的同学。',
    lecturer: 'Tara Murphy',
    tutors: ['Nina', 'Oscar'],
    credits: 6,
    prerequisiteCodes: ['MATH1131', 'COMP9021'],
    ratingBreakdown: { difficulty: 4.2, homework: 4.4, grading: 3.1, harvest: 4.8 },
  },
  uc_1531: {
    tags: ['团队协作', '工程实践', '适合入门'],
    description: '围绕协作开发、测试和交付流程展开，适合补齐软件工程基础。',
    lecturer: 'Sophie Turner',
    tutors: ['Daniel', 'Ivy'],
    credits: 6,
    prerequisiteCodes: [],
    ratingBreakdown: { difficulty: 2.1, homework: 2.8, grading: 3.9, harvest: 4.0 },
  },
  uc_2017: {
    tags: ['系统编程', '练习充足', '节奏平稳'],
    description: '聚焦系统编程基本功，覆盖内存、文件和底层接口的使用。',
    lecturer: 'Grace Chen',
    tutors: ['Patrick', 'Ruby'],
    credits: 6,
    prerequisiteCodes: [],
    ratingBreakdown: { difficulty: 2.3, homework: 3.5, grading: 4.0, harvest: 4.1 },
  },
  uc_2823: {
    tags: ['架构理解', '团队项目', '应用导向'],
    description: '从系统视角介绍软硬件协同与工程实践，强调应用理解。',
    lecturer: 'Michael Tan',
    tutors: ['Ethan', 'Zoe'],
    credits: 6,
    prerequisiteCodes: ['COMP2017'],
    ratingBreakdown: { difficulty: 3.0, homework: 3.8, grading: 3.6, harvest: 4.2 },
  },
  uc_30023: {
    tags: ['内容硬核', '系统方向', '考试常规'],
    description: '围绕计算机系统展开，强调性能、抽象和系统性思维。',
    lecturer: 'Renee Black',
    tutors: ['Mason', 'Aria'],
    credits: 12,
    prerequisiteCodes: ['COMP2017'],
    ratingBreakdown: { difficulty: 3.7, homework: 3.8, grading: 3.4, harvest: 4.5 },
  },
  uc_30024: {
    tags: ['AI 入门', '理论实践结合', '含金量高'],
    description: '覆盖搜索、推理与机器学习基础，适合作为 AI 方向进阶起点。',
    lecturer: 'Olivia Brown',
    tutors: ['Lucas', 'Ella'],
    credits: 12,
    prerequisiteCodes: ['COMP30023'],
    ratingBreakdown: { difficulty: 3.9, homework: 4.0, grading: 3.3, harvest: 4.6 },
  },
}

export const courseCatalog: CourseCatalogEntry[] = universityCourses
  .filter((course) => courseCatalogSeedById[course.id] !== undefined)
  .map((course) => ({
    ...course,
    ...courseCatalogSeedById[course.id],
  }))

export const courseCatalogById = Object.fromEntries(courseCatalog.map((course) => [course.id, course]))

export function getSchoolLabel(schoolId: string) {
  return schoolLabels[schoolId] ?? schoolId
}

export function getSchoolIdByLabel(label: string) {
  return Object.entries(schoolLabels).find(([, schoolLabel]) => schoolLabel === label)?.[0] ?? null
}

export function getCreditUnitLabel(schoolId: string): CourseCreditUnitLabel {
  return schoolId === 'sch_unsw' ? 'UOC' : 'CP'
}

export function formatCourseCredits(course: Pick<CourseCatalogEntry, 'credits' | 'schoolId'>) {
  return `${course.credits} ${getCreditUnitLabel(course.schoolId)}`
}
