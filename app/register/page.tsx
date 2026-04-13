import AuroraBackground from '@/components/landing/AuroraBackground'
import RegisterCard from '@/components/register'

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#05080f] flex items-center justify-center py-12">
      <AuroraBackground />
      <RegisterCard />
    </main>
  )
}
