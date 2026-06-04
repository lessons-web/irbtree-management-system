import { universityCourses } from '../../domain/mockData'
import type { ReviewCourseDetail, ReviewCourseSummary, ReviewEntry, ReviewTerm } from './types'

const SCHOOL_LABELS: Record<string, string> = {
  sch_unsw: 'UNSW',
  sch_usyd: 'USYD',
  sch_unimelb: 'UniMelb',
}

export const TAG_POOL = ['作业多', '给分好', '讲得清楚', '内容硬核', '期末杀手', '实验友好', '刷题多', '含金量高', '考点固定', '水课'] as const
export const GOOD_TAGS = new Set(['给分好', '讲得清楚', '实验友好', '含金量高', '考点固定'])
export const BAD_TAGS = new Set(['作业多', '期末杀手', '刷题多'])

function uniLabel(schoolId: string) {
  return SCHOOL_LABELS[schoolId] ?? schoolId
}

function makeReview(params: {
  id: string
  user: string
  term: ReviewTerm
  year: string
  tags: string[]
  content: string
  date: string
  likes: number
  rating: number
  isLiked?: boolean
}): ReviewEntry {
  return {
    id: params.id,
    user: params.user,
    term: params.term,
    year: params.year,
    tags: params.tags,
    content: params.content,
    date: params.date,
    likes: params.likes,
    isLiked: params.isLiked ?? false,
    rating: params.rating,
    replies: [],
  }
}

export const initialCourseSummaries: ReviewCourseSummary[] = universityCourses.map((c) => {
  const uni = uniLabel(c.schoolId)
  const base = {
    universityCourseId: c.id,
    code: c.code,
    name: c.name,
    uni,
    rating: 4.2,
    reviewCount: 0,
    tags: ['含金量高'],
    color: 'bg-indigo-600',
    likes: 0,
    favorites: 0,
    isLiked: false,
    isFavorited: false,
  }

  if (c.code === 'COMP9021') {
    return { ...base, rating: 4.8, reviewCount: 126, tags: ['内容硬核', '含金量高', '讲得清楚'], color: 'bg-emerald-600', likes: 321, favorites: 189 }
  }
  if (c.code === 'COMP9311') {
    return { ...base, rating: 4.6, reviewCount: 92, tags: ['考点固定', '作业多', '含金量高'], color: 'bg-sky-600', likes: 210, favorites: 140 }
  }
  if (c.code === 'COMP9101') {
    return { ...base, rating: 4.3, reviewCount: 64, tags: ['内容硬核', '刷题多'], color: 'bg-rose-600', likes: 166, favorites: 98 }
  }
  if (c.code === 'COMP1531') {
    return { ...base, rating: 4.1, reviewCount: 51, tags: ['实验友好', '给分好'], color: 'bg-amber-600', likes: 90, favorites: 70 }
  }
  if (c.code === 'COMP2017') {
    return { ...base, rating: 4.2, reviewCount: 57, tags: ['内容硬核', '作业多'], color: 'bg-violet-600', likes: 105, favorites: 82 }
  }
  if (c.code === 'COMP2823') {
    return { ...base, rating: 4.0, reviewCount: 34, tags: ['考点固定', '水课'], color: 'bg-teal-600', likes: 60, favorites: 41 }
  }
  if (c.code === 'COMP30023') {
    return { ...base, rating: 4.4, reviewCount: 73, tags: ['内容硬核', '期末杀手'], color: 'bg-fuchsia-600', likes: 150, favorites: 112 }
  }
  return { ...base, rating: 4.5, reviewCount: 80, tags: ['讲得清楚', '含金量高'], color: 'bg-cyan-600', likes: 140, favorites: 95 }
})

export const initialCourseDetails: ReviewCourseDetail[] = universityCourses.map((c) => {
  const uni = uniLabel(c.schoolId)
  const base: ReviewCourseDetail = {
    universityCourseId: c.id,
    code: c.code,
    name: c.name,
    uni,
    status: '在开',
    statusColor: 'bg-emerald-100 text-emerald-700',
    units: '6 units',
    desc: '课程简介（Mock）：本页面用于把 docs/index.html 的评课逻辑迁移到 React，后续将接真实数据。',
    lecturer: 'Dr. Smith',
    tutors: ['Tutor A', 'Tutor B'],
    prereq: ['Programming basics'],
    tags: ['含金量高'],
    isLiked: false,
    isBookmarked: false,
    ratings: {
      difficulty: { val: 4.2, text: '偏难' },
      homework: { val: 4.0, text: '作业偏多' },
      grading: { val: 4.4, text: '给分友好' },
      harvest: { val: 4.7, text: '收获很大' },
    },
    reviews: [],
  }

  if (c.code === 'COMP9021') {
    return {
      ...base,
      desc: '偏硬核的编程课，覆盖数据结构、算法与 Python 实战。适合想把基础打扎实的同学。',
      lecturer: 'Dr. Andrew',
      tutors: ['Tutor Kevin', 'Tutor Mia'],
      prereq: ['COMP1511 or equivalent'],
      tags: ['内容硬核', '含金量高', '讲得清楚'],
      reviews: [
        makeReview({
          id: 'rv_9021_1',
          user: 'A同学',
          term: 'T3',
          year: '2025',
          tags: ['内容硬核', '含金量高'],
          content: '讲义体系很清晰，作业难度逐步拉升，但做完真的收获巨大。建议早点开刷题。',
          date: '2026-05-12',
          likes: 36,
          rating: 4.8,
        }),
        makeReview({
          id: 'rv_9021_2',
          user: 'B同学',
          term: 'T1',
          year: '2026',
          tags: ['作业多', '讲得清楚'],
          content: '作业量比较大，但 tutor 回答很及时。考试题型稳定，按节奏复习问题不大。',
          date: '2026-06-01',
          likes: 18,
          rating: 4.6,
        }),
      ],
    }
  }

  if (c.code === 'COMP9311') {
    return {
      ...base,
      status: '热门',
      statusColor: 'bg-sky-100 text-sky-700',
      desc: '数据库基础到查询优化的全家桶，SQL 与关系代数会反复考。',
      lecturer: 'Dr. Wang',
      tutors: ['Tutor Ray'],
      prereq: ['COMP2521 or equivalent'],
      tags: ['考点固定', '作业多', '含金量高'],
      reviews: [
        makeReview({
          id: 'rv_9311_1',
          user: 'C同学',
          term: 'T1',
          year: '2025',
          tags: ['考点固定', '含金量高'],
          content: '考点很集中，练好往年题就稳。Project 分工一定要提前，不然后期会爆炸。',
          date: '2026-03-22',
          likes: 22,
          rating: 4.5,
        }),
      ],
    }
  }

  if (c.code === 'COMP9101') {
    return {
      ...base,
      status: '硬核',
      statusColor: 'bg-rose-100 text-rose-700',
      desc: '算法分析与证明占比高，刷题与推导并重，适合想冲算法岗的同学。',
      lecturer: 'Dr. Chen',
      tutors: ['Tutor Ivy'],
      prereq: ['Discrete Mathematics'],
      tags: ['内容硬核', '刷题多'],
    }
  }

  if (c.code === 'COMP1531') {
    return {
      ...base,
      status: '友好',
      statusColor: 'bg-amber-100 text-amber-800',
      desc: '团队协作与工程实践导向，适合训练 Git/CI/测试等基本功。',
      lecturer: 'Dr. James',
      tutors: ['Tutor Lin'],
      prereq: ['Intro programming'],
      tags: ['实验友好', '给分好'],
    }
  }

  return base
})

