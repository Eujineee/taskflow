import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { authApi } from '@/api'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('올바른 이메일 형식이 아닙니다.')
      return
    }
    if (password.length < 8) {
      toast.error('비밀번호는 8자 이상이어야 합니다.')
      return
    }
    if (password !== passwordConfirmation) {
      toast.error('비밀번호가 일치하지 않습니다.')
      return
    }
    setIsLoading(true)
    try {
      const { user, token } = await authApi.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      setAuth(user, token)
      toast.success('회원가입이 완료됐습니다!')
      navigate('/dashboard')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const message =
        err.response?.data?.errors
          ? Object.values(err.response.data.errors)[0][0]
          : err.response?.data?.message ?? '회원가입에 실패했습니다.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg">
            ⚡
          </div>
          <span className="text-xl font-bold tracking-tight">TaskFlow</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-snug mb-4">
            팀과 함께<br />더 스마트하게
          </h1>
          <p className="text-white/65 text-lg leading-relaxed">
            프로젝트를 관리하고, 팀원과 협업하며<br />목표를 달성하세요.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { icon: '📋', label: '칸반 보드로 직관적인 업무 관리' },
            { icon: '👥', label: '팀원과 실시간 협업' },
            { icon: '📊', label: '프로젝트 진행 상황 한눈에 파악' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-white/75 text-sm">
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white text-sm">
              ⚡
            </div>
            <span className="text-lg font-bold">TaskFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">계정 만들기</h2>
            <p className="text-gray-400 mt-1 text-sm">무료로 시작하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">이름</Label>
              <Input
                id="name"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="8자 이상"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password-confirmation" className="text-sm font-medium text-gray-700">비밀번호 확인</Label>
              <Input
                id="password-confirmation"
                type="password"
                placeholder="비밀번호 재입력"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-medium mt-2"
              disabled={isLoading}
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-violet-600 font-medium hover:text-violet-700 transition-colors">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
