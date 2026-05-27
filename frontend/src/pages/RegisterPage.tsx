import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { authApi } from '@/api'
import { useAuthStore } from '@/store/authStore'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

    // 프론트엔드 유효성 검사 (백엔드에도 있지만 UX를 위해 미리 체크)
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
      // Laravel validation 에러는 errors 객체로 옴
      // 첫 번째 에러 메시지만 표시
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">TaskFlow</CardTitle>
          <CardDescription>새 계정을 만들어보세요</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="8자 이상"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password-confirmation">비밀번호 확인</Label>
              <Input
                id="password-confirmation"
                type="password"
                placeholder="비밀번호 재입력"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '가입 중...' : '회원가입'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              로그인
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
