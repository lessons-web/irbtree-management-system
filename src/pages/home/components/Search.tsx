import { Search as SearchIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

export default function Search() {
  const [value, setValue] = useState('')
  const navigate = useNavigate()

  const trimmed = useMemo(() => value.trim(), [value])

  return (
    <form
      className="group relative mx-auto mb-12 max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault()
        if (trimmed) {
          navigate(`/courses?query=${encodeURIComponent(trimmed)}`)
          return
        }
        navigate('/courses')
      }}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <SearchIcon className="h-5 w-5 text-slate-400" />
      </div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="搜索课程代码 (e.g. COMP9021) 或课程名..."
        className="block w-full rounded-full border-2 border-slate-200 bg-white py-4 pr-32 pl-12 text-base placeholder:text-slate-400 shadow-sm transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:outline-none group-hover:shadow-md sm:text-lg"
      />
      <div className="absolute inset-y-0 right-2 flex items-center">
        <button
          type="submit"
          className="rounded-full bg-indigo-600 px-6 py-2 font-medium text-white shadow-md transition hover:bg-indigo-500"
        >
          搜索
        </button>
      </div>
    </form>
  )
}
