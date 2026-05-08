import AuroraBackground from '@/components/landing/AuroraBackground'
import LoginCard from '@/components/login/LoginCard'

export default function LoginPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#05080f] flex items-center justify-center py-12">
      <AuroraBackground />
      <LoginCard />
    </main>
  )
}
