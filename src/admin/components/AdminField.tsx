import type { ChangeEventHandler, ReactNode } from 'react'

type FieldShellProps = {
  label: string
  children: ReactNode
}

type InputProps = {
  label: string
  value: string | number
  onChange: ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  type?: 'text' | 'number'
  min?: number
}

type TextareaProps = {
  label: string
  value: string
  onChange: ChangeEventHandler<HTMLTextAreaElement>
  placeholder?: string
  rows?: number
}

type SelectProps = {
  label: string
  value: string
  onChange: ChangeEventHandler<HTMLSelectElement>
  options: Array<{ value: string; label: string }>
  disabled?: boolean
}

type CheckboxGroupProps = {
  label: string
  values: string[]
  options: Array<{ value: string; label: string }>
  onChange: (values: string[]) => void
}

type RadioGroupProps = {
  label: string
  value: string
  options: Array<{ value: string; label: string; description?: string }>
  onChange: (value: string) => void
  disabled?: boolean
}

function FieldShell({ label, children }: FieldShellProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}

function fieldClassName() {
  return 'w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400'
}

function Input({ label, value, onChange, placeholder, type = 'text', min }: InputProps) {
  return (
    <FieldShell label={label}>
      <input
        aria-label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        min={min}
        className={`h-11 ${fieldClassName()}`}
      />
    </FieldShell>
  )
}

function Textarea({ label, value, onChange, placeholder, rows = 5 }: TextareaProps) {
  return (
    <FieldShell label={label}>
      <textarea
        aria-label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`${fieldClassName()} py-3`}
      />
    </FieldShell>
  )
}

function Select({ label, value, onChange, options, disabled = false }: SelectProps) {
  return (
    <FieldShell label={label}>
      <select aria-label={label} value={value} onChange={onChange} disabled={disabled} className={`h-11 disabled:cursor-not-allowed disabled:bg-slate-100 ${fieldClassName()}`}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

function CheckboxGroup({ label, values, options, onChange }: CheckboxGroupProps) {
  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
        {options.map((option) => {
          const checked = values.includes(option.value)

          return (
            <label key={option.value} className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-slate-700">
              <input
                aria-label={option.label}
                type="checkbox"
                checked={checked}
                onChange={(event) => {
                  if (event.target.checked) {
                    onChange([...values, option.value])
                    return
                  }

                  onChange(values.filter((value) => value !== option.value))
                }}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>{option.label}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

function RadioGroup({ label, value, options, onChange, disabled = false }: RadioGroupProps) {
  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <div className="grid gap-3">
        {options.map((option) => {
          const checked = option.value === value

          return (
            <label
              key={option.value}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                checked
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              } ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            >
              <input
                aria-label={option.label}
                type="radio"
                name={label}
                value={option.value}
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(option.value)}
                className="mt-1 border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="space-y-1">
                <span className="block text-sm font-semibold">{option.label}</span>
                {option.description ? <span className="block text-xs text-slate-500">{option.description}</span> : null}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

const AdminField = {
  Input,
  Select,
  Textarea,
  CheckboxGroup,
  RadioGroup,
}

export default AdminField
