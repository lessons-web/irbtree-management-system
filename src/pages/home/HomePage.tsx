import EnrollmentHelpFab from './components/EnrollmentHelpFab'
import Hero from './components/Hero'
import LearningSummary from './components/LearningSummary'
import PopularCourses from './components/PopularCourses'
import Search from './components/Search'
import Stats from './components/Stats'

export default function HomePage() {
  return (
    <div className="space-y-2">
      <Hero>
        <Search />
        <Stats />
      </Hero>
      <PopularCourses />
      <LearningSummary />
      <EnrollmentHelpFab />
    </div>
  )
}
