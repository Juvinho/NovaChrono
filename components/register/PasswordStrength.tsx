interface Props {
  password: string
}

type Level = 0 | 1 | 2 | 3

function getStrength(pwd: string): Level {
  if (!pwd) return 0
  let score = 0
  if (pwd.length >= 8)  score++
  if (pwd.length >= 12) score++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd))        score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 1) return 1
  if (score <= 3) return 2
  return 3
}

const COLORS: Record<Level, string> = {
  0: 'transparent',
  1: '#ef4444',
  2: '#f59e0b',
  3: '#22c55e',
}

const LABELS: Record<Level, string> = {
  0: '',
  1: 'Fraca',
  2: 'Média',
  3: 'Forte',
}

export default function PasswordStrength({ password }: Props) {
  if (!password) return null

  const strength = getStrength(password)
  const color    = COLORS[strength]

  return (
    <div className="mt-1.5 mb-0.5">
      <div className="flex gap-1">
        {([1, 2, 3] as const).map(i => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full"
            style={{
              background:  i <= strength ? color : 'rgba(255,255,255,0.10)',
              transition:  'background 0.3s ease',
            }}
          />
        ))}
      </div>
      <p
        className="font-display mt-0.5"
        style={{ fontSize: '0.72rem', color, transition: 'color 0.3s ease' }}
      >
        {LABELS[strength]}
      </p>
    </div>
  )
}
