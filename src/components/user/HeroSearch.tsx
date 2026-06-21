import { Search } from 'lucide-react'
import { useState } from 'react'

type HeroSearchProps = {
  initialKeyword?: string
  onSearch: (keyword: string) => void
}

export default function HeroSearch({ initialKeyword = '', onSearch }: HeroSearchProps) {
  const [keyword, setKeyword] = useState(initialKeyword)

  return (
    <form
      className="group relative z-20 mx-auto mb-12 max-w-2xl"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch(keyword.trim())
      }}
    >
      <label htmlFor="hero-course-search" className="sr-only">
        搜索课程
      </label>
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
        <Search size={20} />
      </div>
      <input
        id="hero-course-search"
        type="text"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="搜索课程代码 (e.g. COMP9021) 或课程名..."
        className="block w-full rounded-full border-2 border-slate-200 bg-white py-4 pr-32 pl-12 text-base leading-5 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-100 focus:outline-none group-hover:shadow-md sm:text-lg"
      />
      <div className="absolute inset-y-0 right-2 flex items-center">
        <button
          type="submit"
          className="rounded-full bg-brand-600 px-6 py-2 text-sm font-medium text-white shadow-md transition hover:bg-brand-500"
        >
          搜索
        </button>
      </div>
    </form>
  )
}
