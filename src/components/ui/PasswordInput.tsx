import { useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function PasswordInput({ value, onChange, className = '', ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className={`w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        tabIndex={-1}
        title={showPassword ? 'Hide password' : 'Show password'}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

export default PasswordInput
