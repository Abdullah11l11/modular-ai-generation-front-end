import { Link } from 'react-router-dom'
import { PlaceholderPanel } from '@/components/ui/PlaceholderPanel'

type AuthFormProps = {
  mode: 'login' | 'register'
}

export function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === 'register'

  return (
    <PlaceholderPanel title={isRegister ? 'Create account' : 'Sign in'}>
      <form className="grid max-w-md gap-4">
        {isRegister ? (
          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              className="rounded-md border border-slate-300 px-3 py-2"
              name="name"
              type="text"
            />
          </label>
        ) : null}
        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            name="email"
            type="email"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            name="password"
            type="password"
          />
        </label>
        <button
          className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white"
          type="button"
        >
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-sm">
        {isRegister ? (
          <Link className="text-teal-700" to="/login">
            Already have an account?
          </Link>
        ) : (
          <Link className="text-teal-700" to="/register">
            Create an account
          </Link>
        )}
      </p>
    </PlaceholderPanel>
  )
}
