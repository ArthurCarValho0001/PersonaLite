import type { InputHTMLAttributes } from 'react'
import './FormField.css'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  unidade?: string
}

export function FormField({ label, unidade, id, ...inputProps }: FormFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label} {unidade && <span className="form-field__unidade">({unidade})</span>}
      </label>
      <input id={id} {...inputProps} />
    </div>
  )
}
