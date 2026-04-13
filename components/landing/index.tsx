import AuroraBackground from './AuroraBackground'
import HeroContent from './HeroContent'

export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#05080f] flex items-center justify-center">
      <AuroraBackground />
      <HeroContent />
    </main>
  )
}
