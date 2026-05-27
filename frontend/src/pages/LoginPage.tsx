import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { authApi } from '@/api'
import { useAuthStore } from '@/store/authStore'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  // ── 상태 ────────────────────────────────────────────
  // useState: 이 컴포넌트 안에서만 쓰는 로컬 변수
  // [값, 값을바꾸는함수] = useState(초기값)
  // PHP로 치면 그냥 $email = '' 인데, 값이 바뀌면 화면을 자동으로 다시 그려줌
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // ── 스토어 & 라우터 ──────────────────────────────────
  // Zustand 스토어에서 setAuth 함수 꺼내오기
  const setAuth = useAuthStore((state) => state.setAuth)
  // useNavigate: 코드로 페이지 이동할 때 사용 (redirect 같은 것)
  const navigate = useNavigate()

  // ── 폼 제출 핸들러 ───────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault(): 폼 기본 동작(페이지 새로고침) 막기
    // PHP의 경우 form action으로 POST 보내지만
    // React는 새로고침 없이 JS로 처리함
    e.preventDefault()
    setIsLoading(true)

    try {
      // API 호출 → 백엔드에 로그인 요청
      const { user, token } = await authApi.login({ email, password })

      // 성공 → 스토어에 유저 정보 저장 (localStorage에도 자동 저장됨)
      setAuth(user, token)

      // 대시보드로 이동
      navigate('/dashboard')
    } catch (error: unknown) {
      // 실패 → 에러 토스트 표시
      const message =
        (error as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? '로그인에 실패했습니다.'
      toast.error(message)
    } finally {
      // 성공/실패 관계없이 로딩 해제
      setIsLoading(false)
    }
  }

  // ── 화면 렌더링 ──────────────────────────────────────
  // return 안의 JSX = HTML처럼 생겼지만 JavaScript임
  // className = HTML의 class (class는 JS 예약어라 className 사용)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">TaskFlow</CardTitle>
          <CardDescription>이메일과 비밀번호로 로그인하세요</CardDescription>
        </CardHeader>

        <CardContent>
          {/* onSubmit: 폼 제출 시 handleSubmit 실행 */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-1">
              <Label htmlFor="email">이메일</Label>
              {/* value + onChange: "제어 컴포넌트" 패턴
                  input의 값을 React state로 직접 관리
                  사용자가 타이핑할 때마다 setEmail 호출 → email 변수 업데이트 */}
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* disabled: 로딩 중엔 버튼 비활성화 (중복 클릭 방지) */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            계정이 없으신가요?{' '}
            {/* Link: <a> 태그인데 페이지 새로고침 없이 이동 */}
            <Link to="/register" className="text-primary font-medium hover:underline">
              회원가입
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
