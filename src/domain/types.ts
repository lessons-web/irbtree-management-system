export type Id = string

export type UniversityCourse = {
  id: Id
  code: string
  name: string
  schoolId: Id
  termId: Id
}

export type ProductCourse = {
  id: Id
  slug: string
  name: string
}

export type CourseLink = {
  id: Id
  productCourseId: Id
  universityCourseId: Id
}

export type Review = {
  id: Id
  universityCourseId: Id
  rating: number
  createdAt: string
}

export type Enrollment = {
  id: Id
  userId: Id
  productCourseId: Id
  expiresAt: string
}
