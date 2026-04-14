'use client'

import { type MouseEvent as ReactMouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import {
  BarChart3,
  Bell,
  Bookmark,
  Calendar,
  ChevronDown,
  Image as ImageIcon,
  LayoutGrid,
  LogOut,
  MessageCircle,
  Repeat2,
  Search,
  Settings,
  Share2,
  Smile,
  Zap,
} from 'lucide-react'

type TabKey = 'todos' | 'seguindo' | 'midia' | 'enquetes'

type PollOption = {
  label: string
  pct: number
}

type PollData = {
  options: PollOption[]
  votes: number
  closed: boolean
}

type RepostData = {
  user: string
  time: string
  text: string
  image?: string
}

type PostState = {
  repost: boolean
  like: boolean
  bookmark: boolean
}

type PostMetrics = {
  comments: number
  reposts: number
  likes: number
}

type Post = {
  id: string
  user: string
  avatar: string
  time: string
  text: string
  verified: boolean
  following: boolean
  image?: string
  poll?: PollData
  repostInfo?: string
  repost?: RepostData
  thread?: boolean
  threadNote?: string
  metrics: PostMetrics
  state: PostState
}

type HeaderPanel = 'none' | 'bookmarks' | 'notifications' | 'settings' | 'profile' | 'logout'

type HeaderAction =
  | 'grid'
  | 'bookmarks'
  | 'notifications'
  | 'settings'
  | 'profile'
  | 'logout'
  | 'profile-view'
  | 'profile-edit'
  | 'profile-posts'
  | 'profile-logout'
  | 'notifications-mark-read'

type ViewMode = 'feed' | 'profile' | 'signedOut'

type SavedItemKind = 'posts' | 'midia' | 'enquetes'

type SavedItem = {
  id: string
  user: string
  avatar: string
  text: string
  type: SavedItemKind
  source: 'post' | 'mock'
}

type HeaderNotification = {
  id: string
  user: string
  message: string
  time: string
  unread: boolean
}

type TimelineDay = {
  key: string
  label: string
  isToday: boolean
  activityCount: number
  avatars: string[]
}

const displayFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
  variable: '--font-display',
})

const bodyFont = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-body',
})

const monthPt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const timelineActivityByOffset: Record<string, { count: number; seeds: string[] }> = {
  '-10': { count: 2, seeds: ['d10-a', 'd10-b'] },
  '-8': { count: 1, seeds: ['d8-a'] },
  '-7': { count: 3, seeds: ['d7-a', 'd7-b', 'd7-c'] },
  '-5': { count: 2, seeds: ['d5-a', 'd5-b'] },
  '-3': { count: 4, seeds: ['d3-a', 'd3-b', 'd3-c'] },
  '-1': { count: 1, seeds: ['d1-a'] },
}

const initialPosts: Post[] = [
  {
    id: 'p1',
    user: '@cuberta_dobrada',
    avatar: 'https://picsum.photos/seed/p1-avatar/80/80',
    time: 'ha 8 min',
    text: 'A chuva neon refletindo no asfalto hoje parecia frame de filme antigo. #artedistopica',
    verified: true,
    following: true,
    metrics: { comments: 5, reposts: 2, likes: 12 },
    state: { repost: false, like: false, bookmark: false },
  },
  {
    id: 'p2',
    user: '@Sus_Bacon',
    avatar: 'https://picsum.photos/seed/p2-avatar/80/80',
    time: 'ha 21 min',
    text: 'A ponte de aco no fim da avenida acendeu sozinha de novo. Alguem mais viu?',
    image: 'https://picsum.photos/seed/chrono-bridge/760/420',
    verified: false,
    following: false,
    metrics: { comments: 17, reposts: 6, likes: 34 },
    state: { repost: false, like: true, bookmark: false },
  },
  {
    id: 'p3',
    user: '@padaria_quantica',
    avatar: 'https://picsum.photos/seed/p3-avatar/80/80',
    time: 'ha 39 min',
    text: 'Enquete encerrada da madrugada:',
    verified: false,
    following: true,
    poll: {
      options: [
        { label: 'pao de queijo', pct: 0 },
        { label: 'pao de batata', pct: 0 },
        { label: 'ou', pct: 100 },
      ],
      votes: 1,
      closed: true,
    },
    metrics: { comments: 2, reposts: 1, likes: 9 },
    state: { repost: false, like: false, bookmark: true },
  },
  {
    id: 'p4',
    user: '@eco_do_tunel',
    avatar: 'https://picsum.photos/seed/p4-avatar/80/80',
    time: 'ha 1 h',
    text: 'Ecoei isso porque resume bem o que a cidade virou hoje cedo.',
    verified: true,
    following: false,
    repostInfo: '↩ @ferrovelho Ecoou',
    repost: {
      user: '@ferrovelho',
      time: 'ha 1 h',
      text: 'A estacao velha abriu as portas por 47 segundos. Quem entrou saiu com cheiro de mar.',
      image: 'https://picsum.photos/seed/chrono-station/700/360',
    },
    metrics: { comments: 6, reposts: 4, likes: 21 },
    state: { repost: true, like: false, bookmark: false },
  },
  {
    id: 'p5',
    user: '@linha_13',
    avatar: 'https://picsum.photos/seed/p5-avatar/80/80',
    time: 'ha 2 h',
    text: 'Parte 2/4: o sinal da torre mudou para violeta. To juntando tudo neste cordao.',
    verified: false,
    following: true,
    thread: true,
    threadNote: 'Este post faz parte de um cordao em andamento.',
    metrics: { comments: 9, reposts: 2, likes: 18 },
    state: { repost: false, like: false, bookmark: false },
  },
  {
    id: 'p6',
    user: '@cronista_da_rua',
    avatar: 'https://picsum.photos/seed/p6-avatar/80/80',
    time: 'ha 3 h',
    text: 'Atualizando o mapa colaborativo: 3 relatos novos no setor oeste e 1 no setor central.',
    verified: true,
    following: false,
    thread: true,
    threadNote: '5 comentarios conectados neste cordao.',
    metrics: { comments: 13, reposts: 3, likes: 15 },
    state: { repost: false, like: false, bookmark: false },
  },
]

const popularPosts = [
  {
    id: 'popular-1',
    user: '@cuberta_dobrada',
    avatar: 'https://picsum.photos/seed/cuberta/64/64',
    date: '9 de fev.',
    text: 'Nunca vi a rua principal tao vazia e tao bonita ao mesmo tempo. #artedistopica me deixou sem ar.',
    metrics: { comments: 12, reposts: 5, likes: 31 },
  },
  {
    id: 'popular-2',
    user: '@Sus_Bacon',
    avatar: 'https://picsum.photos/seed/susbacon/64/64',
    date: '8 de fev.',
    repostInfo: '↩ @Sus_Bacon Ecoou',
    text: 'O trem passou de novo as 03:17 e todo mundo jurou que ouviu canto vindo da ponte.',
    metrics: { comments: 8, reposts: 2, likes: 19 },
  },
  {
    id: 'popular-3',
    user: '@satelite_urbano',
    avatar: 'https://picsum.photos/seed/pollmaker/64/64',
    date: '7 de fev.',
    text: 'Enquete do dia:',
    pollPreview: [
      { label: 'Trilha 01', pct: 38 },
      { label: 'Trilha 02', pct: 24 },
      { label: 'Silencio', pct: 38 },
    ],
    metrics: { comments: 4, reposts: 6, likes: 11 },
  },
]

const threadTags = [
  { name: '#ossodemais', count: 2 },
  { name: '#fodademais', count: 1 },
  { name: '#Railway', count: 1 },
  { name: '#artedistopica', count: 4 },
  { name: '#chrono', count: 7 },
]

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'todos', label: 'Todos' },
  { key: 'seguindo', label: 'Seguindo' },
  { key: 'midia', label: 'Midia' },
  { key: 'enquetes', label: 'Enquetes' },
]

const bookmarkTabs: Array<{ key: 'todos' | SavedItemKind; label: string }> = [
  { key: 'todos', label: 'Todos' },
  { key: 'posts', label: 'Posts' },
  { key: 'midia', label: 'Midia' },
  { key: 'enquetes', label: 'Enquetes' },
]

const initialHeaderNotifications: HeaderNotification[] = [
  {
    id: 'notif-1',
    user: '@Sus_Bacon',
    message: 'reagiu ao seu post',
    time: '2min',
    unread: true,
  },
  {
    id: 'notif-2',
    user: '@orbital_zero',
    message: 'comentou: "isso mesmo"',
    time: '8min',
    unread: true,
  },
  {
    id: 'notif-3',
    user: '@nebula_core',
    message: 'ecoou seu post',
    time: '23min',
    unread: false,
  },
]

const fallbackSavedItems: SavedItem[] = [
  {
    id: 'mock-bookmark-1',
    user: '@cuberta_dobrada',
    avatar: 'https://picsum.photos/seed/book-cuberta/56/56',
    text: 'Nunca vi a rua principal tao vazia e tao bonita ao mesmo tempo...',
    type: 'posts',
    source: 'mock',
  },
  {
    id: 'mock-bookmark-2',
    user: '@Sus_Bacon',
    avatar: 'https://picsum.photos/seed/book-susbacon/56/56',
    text: 'A ponte de aco no fim da avenida acendeu sozinha de novo...',
    type: 'midia',
    source: 'mock',
  },
  {
    id: 'mock-bookmark-3',
    user: '@padaria_quantica',
    avatar: 'https://picsum.photos/seed/book-padaria/56/56',
    text: 'os logs do servidor antigo ainda estao la intactos',
    type: 'enquetes',
    source: 'mock',
  },
]

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toTimelineLabel(date: Date, offset: number) {
  if (offset === -1) {
    return 'Ontem'
  }

  if (offset === 0) {
    return 'Hoje'
  }

  if (offset === 1) {
    return 'Amanha'
  }

  return `${monthPt[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function normalized(value: string) {
  return value.toLowerCase().trim()
}

function bindClickOutside(
  element: HTMLElement,
  onClose: () => void,
  shouldIgnore?: (target: EventTarget | null) => boolean,
) {
  function handler(event: MouseEvent) {
    const target = event.target as Node | null

    if (!target) {
      return
    }

    if (element.contains(target)) {
      return
    }

    if (shouldIgnore?.(event.target)) {
      return
    }

    onClose()
    document.removeEventListener('click', handler)
  }

  window.requestAnimationFrame(() => {
    document.addEventListener('click', handler)
  })

  return () => {
    document.removeEventListener('click', handler)
  }
}

export default function EchoFramePage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [activeTab, setActiveTab] = useState<TabKey>('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeView, setActiveView] = useState<ViewMode>('feed')
  const [composerText, setComposerText] = useState('')
  const [showSkeleton, setShowSkeleton] = useState(true)
  const [showStagger, setShowStagger] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [newPostId, setNewPostId] = useState<string | null>(null)
  const [tabAnimating, setTabAnimating] = useState(false)
  const [feedFlashing, setFeedFlashing] = useState(false)
  const [popKey, setPopKey] = useState('')
  const [pollBarsReady, setPollBarsReady] = useState(false)
  const [isCompactFeed, setIsCompactFeed] = useState(false)
  const [activeHeaderPanel, setActiveHeaderPanel] = useState<HeaderPanel>('none')
  const [bookmarkTab, setBookmarkTab] = useState<'todos' | SavedItemKind>('todos')
  const [notifications, setNotifications] = useState<HeaderNotification[]>(initialHeaderNotifications)
  const [dismissedMockBookmarkIds, setDismissedMockBookmarkIds] = useState<string[]>([])

  const composerRef = useRef<HTMLTextAreaElement | null>(null)
  const todayRef = useRef<HTMLButtonElement | null>(null)
  const notificationsButtonRef = useRef<HTMLButtonElement | null>(null)
  const notificationsPanelRef = useRef<HTMLElement | null>(null)
  const profileButtonRef = useRef<HTMLButtonElement | null>(null)
  const profilePanelRef = useRef<HTMLElement | null>(null)

  const nowBase = useMemo(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }, [])

  const timelineDays = useMemo<TimelineDay[]>(() => {
    const dayList: TimelineDay[] = []

    for (let offset = -10; offset <= 10; offset += 1) {
      const date = new Date(nowBase)
      date.setDate(nowBase.getDate() + offset)
      const activity = timelineActivityByOffset[String(offset)] ?? { count: 0, seeds: [] }

      dayList.push({
        key: toDateKey(date),
        label: toTimelineLabel(date, offset),
        isToday: offset === 0,
        activityCount: activity.count,
        avatars: activity.seeds,
      })
    }

    return dayList
  }, [nowBase])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setShowSkeleton(false)
      setShowStagger(true)
    }, 800)

    return () => window.clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const today = timelineDays.find((day) => day.isToday)

    if (!today) {
      return
    }

    setSelectedDate(today.key)

    const timeout = window.setTimeout(() => {
      todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }, 120)

    return () => window.clearTimeout(timeout)
  }, [timelineDays])

  useEffect(() => {
    if (!composerRef.current) {
      return
    }

    composerRef.current.style.height = 'auto'
    composerRef.current.style.height = `${Math.min(composerRef.current.scrollHeight, 220)}px`
  }, [composerText])

  useEffect(() => {
    if (showSkeleton) {
      return
    }

    setPollBarsReady(false)
    const raf = window.requestAnimationFrame(() => {
      setPollBarsReady(true)
    })

    return () => window.cancelAnimationFrame(raf)
  }, [showSkeleton, activeTab, searchTerm, posts.length])

  const filteredPosts = useMemo(() => {
    const query = normalized(searchTerm)

    return posts.filter((post) => {
      const tabMatch =
        activeTab === 'todos' ||
        (activeTab === 'seguindo' && post.following) ||
        (activeTab === 'midia' && Boolean(post.image || post.repost?.image)) ||
        (activeTab === 'enquetes' && Boolean(post.poll))

      if (!tabMatch) {
        return false
      }

      if (!query) {
        return true
      }

      const haystack = `${post.user} ${post.text} ${post.threadNote ?? ''} ${post.repost?.text ?? ''}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [activeTab, posts, searchTerm])

  const myPosts = useMemo(() => posts.filter((post) => normalized(post.user) === '@juvinho'), [posts])

  const savedPosts = useMemo<SavedItem[]>(() => {
    return posts
      .filter((post) => post.state.bookmark)
      .map((post) => ({
        id: post.id,
        user: post.user,
        avatar: post.avatar,
        text: post.text,
        type: post.poll ? 'enquetes' : post.image || post.repost?.image ? 'midia' : 'posts',
        source: 'post',
      }))
  }, [posts])

  const savedItems = useMemo<SavedItem[]>(() => {
    if (savedPosts.length > 0) {
      return savedPosts
    }

    return fallbackSavedItems.filter((item) => !dismissedMockBookmarkIds.includes(item.id))
  }, [dismissedMockBookmarkIds, savedPosts])

  const visibleSavedItems = useMemo(() => {
    if (bookmarkTab === 'todos') {
      return savedItems
    }

    return savedItems.filter((item) => item.type === bookmarkTab)
  }, [bookmarkTab, savedItems])

  const notificationCount = useMemo(
    () => notifications.reduce((total, item) => total + (item.unread ? 1 : 0), 0),
    [notifications],
  )

  const isBookmarksOpen = activeHeaderPanel === 'bookmarks'
  const isNotificationsOpen = activeHeaderPanel === 'notifications'
  const isSettingsOpen = activeHeaderPanel === 'settings'
  const isProfileMenuOpen = activeHeaderPanel === 'profile'
  const isLogoutOpen = activeHeaderPanel === 'logout'

  useEffect(() => {
    document.body.classList.toggle('feed--compact', isCompactFeed)

    return () => {
      document.body.classList.remove('feed--compact')
    }
  }, [isCompactFeed])

  useEffect(() => {
    if (!isNotificationsOpen || !notificationsPanelRef.current) {
      return
    }

    return bindClickOutside(
      notificationsPanelRef.current,
      () => {
        setActiveHeaderPanel((current) => (current === 'notifications' ? 'none' : current))
      },
      (target) => notificationsButtonRef.current?.contains(target as Node) ?? false,
    )
  }, [isNotificationsOpen])

  useEffect(() => {
    if (!isProfileMenuOpen || !profilePanelRef.current) {
      return
    }

    return bindClickOutside(
      profilePanelRef.current,
      () => {
        setActiveHeaderPanel((current) => (current === 'profile' ? 'none' : current))
      },
      (target) => profileButtonRef.current?.contains(target as Node) ?? false,
    )
  }, [isProfileMenuOpen])

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return
      }

      setActiveHeaderPanel('none')
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const logHeader = useCallback((message: string, action?: string) => {
    if (process.env.NODE_ENV === 'production') {
      return
    }

    if (action) {
      console.log(`[HeaderActions] ${message}:`, action)
      return
    }

    console.log(`[HeaderActions] ${message}`)
  }, [])

  const markNotificationsRead = useCallback(() => {
    setNotifications((current) =>
      current.map((item) => {
        if (!item.unread) {
          return item
        }

        return { ...item, unread: false }
      }),
    )
  }, [])

  const handleHeaderActionsClick = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      const trigger = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-action]')

      if (!trigger) {
        return
      }

      const action = trigger.dataset.action as HeaderAction | undefined

      if (!action) {
        return
      }

      event.preventDefault()
      logHeader('click action', action)

      switch (action) {
        case 'grid':
          setIsCompactFeed((current) => !current)
          setActiveView('feed')
          return

        case 'bookmarks':
          setActiveView('feed')
          setActiveHeaderPanel((current) => (current === 'bookmarks' ? 'none' : 'bookmarks'))
          return

        case 'notifications':
          setActiveHeaderPanel((current) => {
            const next = current === 'notifications' ? 'none' : 'notifications'
            if (next === 'notifications') {
              logHeader('notifications open')
            }
            return next
          })
          markNotificationsRead()
          return

        case 'notifications-mark-read':
          markNotificationsRead()
          return

        case 'settings':
          setActiveHeaderPanel((current) => (current === 'settings' ? 'none' : 'settings'))
          return

        case 'profile':
          setActiveHeaderPanel((current) => {
            const next = current === 'profile' ? 'none' : 'profile'
            if (next === 'profile') {
              logHeader('profile toggle')
            }
            return next
          })
          return

        case 'profile-view':
          setActiveView('profile')
          setActiveHeaderPanel('none')
          return

        case 'profile-edit':
          setActiveView('feed')
          setActiveHeaderPanel('settings')
          return

        case 'profile-posts':
          setActiveView('feed')
          setSearchTerm('@Juvinho')
          setActiveHeaderPanel('none')
          return

        case 'profile-logout':
        case 'logout':
          logHeader('logout open')
          setActiveHeaderPanel('logout')
          return

        default:
          return
      }
    },
    [logHeader, markNotificationsRead],
  )

  const closeHeaderPanels = useCallback(() => {
    setActiveHeaderPanel('none')
  }, [])

  const handleRemoveSavedItem = useCallback((item: SavedItem) => {
    if (item.source === 'post') {
      setPosts((current) =>
        current.map((post) => {
          if (post.id !== item.id) {
            return post
          }

          return {
            ...post,
            state: { ...post.state, bookmark: false },
          }
        }),
      )
      return
    }

    setDismissedMockBookmarkIds((current) => {
      if (current.includes(item.id)) {
        return current
      }
      return [...current, item.id]
    })
  }, [])

  const handleConfirmLogout = useCallback(() => {
    setActiveHeaderPanel('none')
    setActiveView('signedOut')
  }, [])

  const handleRestoreSession = useCallback(() => {
    setActiveView('feed')
    setSearchTerm('')
    setActiveHeaderPanel('none')
  }, [])

  function triggerPop(key: string) {
    setPopKey(key)
    window.setTimeout(() => {
      setPopKey((current) => (current === key ? '' : current))
    }, 220)
  }

  function triggerTabAnimation() {
    setTabAnimating(false)
    window.requestAnimationFrame(() => {
      setTabAnimating(true)
      window.setTimeout(() => {
        setTabAnimating(false)
      }, 280)
    })
  }

  function triggerFeedFlash() {
    setFeedFlashing(false)
    window.requestAnimationFrame(() => {
      setFeedFlashing(true)
      window.setTimeout(() => {
        setFeedFlashing(false)
      }, 300)
    })
  }

  function handleToggleAction(postId: string, action: 'comment' | 'repost' | 'like' | 'share' | 'bookmark') {
    if (action === 'comment' || action === 'share') {
      triggerPop(`${postId}-${action}`)
      return
    }

    setPosts((current) =>
      current.map((post) => {
        if (post.id !== postId) {
          return post
        }

        if (action === 'like') {
          const nextLike = !post.state.like
          return {
            ...post,
            state: { ...post.state, like: nextLike },
            metrics: {
              ...post.metrics,
              likes: Math.max(0, post.metrics.likes + (nextLike ? 1 : -1)),
            },
          }
        }

        if (action === 'repost') {
          const nextRepost = !post.state.repost
          return {
            ...post,
            state: { ...post.state, repost: nextRepost },
            metrics: {
              ...post.metrics,
              reposts: Math.max(0, post.metrics.reposts + (nextRepost ? 1 : -1)),
            },
          }
        }

        return {
          ...post,
          state: { ...post.state, bookmark: !post.state.bookmark },
        }
      }),
    )

    triggerPop(`${postId}-${action}`)
  }

  function handlePublish() {
    const cleanText = composerText.trim()

    if (!cleanText) {
      return
    }

    const id = `new-${Date.now()}`

    setPosts((current) => [
      {
        id,
        user: '@Juvinho',
        avatar: 'https://picsum.photos/seed/new-juvinho/80/80',
        time: 'agora',
        text: cleanText,
        verified: true,
        following: true,
        metrics: { comments: 0, reposts: 0, likes: 0 },
        state: { repost: false, like: false, bookmark: false },
      },
      ...current,
    ])

    setComposerText('')
    setNewPostId(id)

    window.setTimeout(() => {
      setNewPostId((current) => (current === id ? null : current))
    }, 350)

    document.getElementById('echoframe-feed-start')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={`${displayFont.variable} ${bodyFont.variable} echoframe-page`}>
      <div className="bg-particles" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <header className="top-header" data-role="top-header">
        <div className="header-inner">
          <a href="#" className="brand-link" aria-label="Chrono Home">
            <svg className="logo-mark" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="16" cy="16" r="14" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
              <path
                d="M20.8 11.3C19.7 9.95 18.1 9.2 16.1 9.2C12.4 9.2 9.6 12 9.6 15.8C9.6 19.6 12.4 22.4 16.1 22.4C18.2 22.4 19.9 21.6 21 20.2"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="22.7" cy="21.9" r="1.3" fill="#ffffff" />
            </svg>
            <span>Chrono</span>
          </a>

          <div className="search-slot">
            <label className="search-wrap" aria-label="Buscar posts">
              <input
                type="search"
                placeholder="Buscar '$artedistopica'..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <Search />
            </label>
          </div>

          <div className="header-actions" data-role="top-header-actions" onClick={handleHeaderActionsClick}>
            <button
              className={`icon-btn mobile-hide header-action-btn${isCompactFeed ? ' is-active' : ''}`}
              aria-label="Visualizacao em grade"
              type="button"
              data-action="grid"
            >
              <LayoutGrid />
            </button>

            <button
              className={`icon-btn mobile-hide header-action-btn${isBookmarksOpen ? ' is-active' : ''}`}
              aria-label="Bookmarks"
              type="button"
              data-action="bookmarks"
            >
              <Bookmark />
            </button>

            <div className="header-action-wrap">
              <button
                ref={notificationsButtonRef}
                className={`icon-btn header-action-btn${isNotificationsOpen ? ' is-active' : ''}`}
                aria-label="Notificacoes"
                type="button"
                data-action="notifications"
              >
                <Bell />
                {notificationCount > 0 ? <span className="notif-badge">{notificationCount}</span> : null}
              </button>

              <section
                ref={notificationsPanelRef}
                className={`header-dropdown notif-dropdown${isNotificationsOpen ? ' is-open' : ''}`}
                aria-label="Painel de notificacoes"
                aria-hidden={!isNotificationsOpen}
              >
                <header className="notif-dropdown-head">
                  <h4>Notificacoes</h4>
                  <button className="mark-read-btn" type="button" data-action="notifications-mark-read">
                    Marcar todas como lidas
                  </button>
                </header>

                <ul className="notif-dropdown-list">
                  {notifications.map((item) => (
                    <li key={item.id} className={`notif-dropdown-item${item.unread ? ' unread' : ''}`}>
                      <div className="notif-dropdown-body">
                        <strong>{item.user}</strong> {item.message}
                      </div>
                      <span className="notif-dropdown-time">{item.time}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <button
              className={`icon-btn mobile-hide header-action-btn${isSettingsOpen ? ' is-active' : ''}`}
              aria-label="Configuracoes"
              type="button"
              data-action="settings"
            >
              <Settings />
            </button>

            <div className="header-action-wrap profile-wrap">
              <button
                ref={profileButtonRef}
                className={`profile-chip header-profile-btn${isProfileMenuOpen ? ' is-open' : ''}`}
                aria-label="Perfil do usuario"
                type="button"
                data-action="profile"
              >
                <img src="https://picsum.photos/seed/juvinho-profile/32/32" alt="Avatar @Juvinho" />
                <span>@Juvinho</span>
                <ChevronDown />
              </button>

              <section
                ref={profilePanelRef}
                className={`header-dropdown profile-menu-dropdown${isProfileMenuOpen ? ' is-open' : ''}`}
                aria-label="Menu de perfil"
                aria-hidden={!isProfileMenuOpen}
              >
                <button type="button" className="profile-menu-item" data-action="profile-view">
                  Ver perfil
                </button>
                <button type="button" className="profile-menu-item" data-action="profile-edit">
                  Editar perfil
                </button>
                <button type="button" className="profile-menu-item" data-action="profile-posts">
                  Meus posts
                </button>
                <button type="button" className="profile-menu-item logout-item" data-action="profile-logout">
                  Sair
                </button>
              </section>
            </div>

            <button className="icon-btn header-action-btn" aria-label="Logout" type="button" data-action="logout">
              <LogOut />
            </button>
          </div>
        </div>
      </header>

      <div className={`header-overlay${isBookmarksOpen ? ' is-visible' : ''}`} aria-hidden={!isBookmarksOpen} onClick={closeHeaderPanels} />

      <aside className={`header-drawer bookmark-drawer${isBookmarksOpen ? ' is-open' : ''}`} aria-label="Painel de salvos" aria-hidden={!isBookmarksOpen}>
        <header className="drawer-head">
          <h3>Salvos</h3>
          <button type="button" className="drawer-close-btn" onClick={closeHeaderPanels} aria-label="Fechar salvos">
            ×
          </button>
        </header>

        <div className="bookmark-tabs" role="tablist" aria-label="Filtros de salvos">
          {bookmarkTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`bookmark-tab${bookmarkTab === tab.key ? ' active' : ''}`}
              onClick={() => setBookmarkTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {visibleSavedItems.length === 0 ? (
          <div className="saved-empty">Nenhum item salvo neste filtro.</div>
        ) : (
          <ul className="saved-list">
            {visibleSavedItems.map((item) => (
              <li key={item.id} className="saved-item">
                <img src={item.avatar} alt={`Avatar ${item.user}`} />
                <div className="saved-copy">
                  <strong>{item.user}</strong>
                  <p>{item.text}</p>
                </div>
                <button type="button" className="saved-remove-btn" onClick={() => handleRemoveSavedItem(item)}>
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section
        className={`settings-overlay${isSettingsOpen ? ' is-open' : ''}`}
        aria-hidden={!isSettingsOpen}
        onClick={closeHeaderPanels}
      >
        <div className="settings-card" role="dialog" aria-modal="true" aria-label="Configuracoes" onClick={(event) => event.stopPropagation()}>
          <h3>Configuracoes</h3>
          <p>Ajustes principais da conta e experiencia.</p>
          <ul className="settings-grid" aria-label="Categorias de configuracao">
            <li>Conta</li>
            <li>Aparencia</li>
            <li>Privacidade</li>
            <li>Notificacoes</li>
          </ul>
          <button type="button" className="settings-back-btn" onClick={closeHeaderPanels}>
            Fechar
          </button>
        </div>
      </section>

      <section className={`logout-overlay${isLogoutOpen ? ' is-open' : ''}`} aria-hidden={!isLogoutOpen} onClick={closeHeaderPanels}>
        <div className="logout-dialog" role="dialog" aria-modal="true" aria-label="Confirmar logout" onClick={(event) => event.stopPropagation()}>
          <p>Deseja sair da Chrono?</p>
          <span className="logout-subtitle">Sua sessao atual sera encerrada.</span>
          <div className="logout-actions">
            <button type="button" className="logout-cancel" onClick={closeHeaderPanels}>
              Cancelar
            </button>
            <button type="button" className="logout-confirm" onClick={handleConfirmLogout}>
              Sair
            </button>
          </div>
        </div>
      </section>

      <main className="app-main" id="echoframe-feed-start">
        <div className="columns">
          <aside className="left-sidebar" aria-label="Posts populares">
            <h2 className="section-title">:: POSTS POPULARES</h2>
            <section className="panel popular-list">
              {popularPosts.map((item) => (
                <article className="popular-post" key={item.id}>
                  {item.repostInfo ? <p className="mini-repost">{item.repostInfo}</p> : null}
                  <div className="mini-head">
                    <img src={item.avatar} alt={`Avatar ${item.user}`} />
                    <div className="mini-user">
                      <b>{item.user}</b>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                  <p className="mini-text">{item.text}</p>

                  {item.pollPreview ? (
                    <div className="mini-poll" aria-label="Preview de enquete popular">
                      {item.pollPreview.map((row) => (
                        <div className="mini-poll-row" key={row.label}>
                          <span>{row.label}</span>
                          <div className="mini-poll-bar">
                            <span style={{ width: `${row.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="mini-actions">
                    <MessageCircle />
                    <span>{item.metrics.comments}</span>
                    <Repeat2 />
                    <span>{item.metrics.reposts}</span>
                    <Zap />
                    <span>{item.metrics.likes}</span>
                    <Share2 />
                  </div>
                </article>
              ))}
            </section>
          </aside>

          <section className={`feed-column${isCompactFeed ? ' feed--compact' : ' feed--default'}`} aria-label="Feed principal">
            {activeView === 'signedOut' ? (
              <section className="view-card signed-out-card" aria-label="Sessao encerrada">
                <h3>Sessao encerrada</h3>
                <p>Voce saiu da Chrono. Entre novamente para voltar ao feed principal.</p>
                <div className="view-card-actions">
                  <button type="button" className="publish-btn" onClick={handleRestoreSession}>
                    Entrar novamente
                  </button>
                </div>
              </section>
            ) : null}

            {activeView === 'profile' ? (
              <section className="view-card profile-view-card" aria-label="Visao de perfil">
                <h3>@Juvinho</h3>
                <p>Perfil mockado para navegacao pelo menu superior.</p>
                <p className="profile-view-meta">Posts encontrados: {myPosts.length}</p>

                <ul className="profile-view-list">
                  {(myPosts.length ? myPosts : posts.slice(0, 3)).slice(0, 3).map((post) => (
                    <li key={post.id}>{post.text}</li>
                  ))}
                </ul>

                <div className="view-card-actions">
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => {
                      setSearchTerm('@Juvinho')
                      setActiveView('feed')
                    }}
                  >
                    Meus posts
                  </button>
                  <button type="button" className="ghost-btn" onClick={() => setActiveHeaderPanel('settings')}>
                    Editar perfil
                  </button>
                  <button type="button" className="publish-btn" onClick={() => setActiveView('feed')}>
                    Voltar ao feed
                  </button>
                </div>
              </section>
            ) : null}

            {activeView === 'feed' ? (
              <>
                <nav className="tabs-row" aria-label="Filtros do feed">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`feed-tab${activeTab === tab.key ? ' active' : ''}`}
                  onClick={() => {
                    if (activeTab !== tab.key) {
                      setActiveTab(tab.key)
                      triggerTabAnimation()
                    }
                  }}
                >
                  {tab.label}
                </button>
              ))}
                </nav>

            <section className="composer" aria-label="Novo post">
              <div className="composer-top">
                <img src="https://picsum.photos/seed/juvinho-compose/64/64" alt="Avatar @Juvinho" />
                <label>
                  <span className="sr-only">Escreva um post</span>
                  <textarea
                    ref={composerRef}
                    placeholder="O que esta acontecendo?"
                    value={composerText}
                    onChange={(event) => setComposerText(event.target.value)}
                  />
                </label>
              </div>
              <div className="composer-bottom">
                <div className="composer-tools" aria-hidden="true">
                  <button className="icon-btn" type="button" tabIndex={-1} aria-label="Adicionar imagem">
                    <ImageIcon />
                  </button>
                  <button className="icon-btn" type="button" tabIndex={-1} aria-label="Criar enquete">
                    <BarChart3 />
                  </button>
                  <button className="icon-btn" type="button" tabIndex={-1} aria-label="Adicionar emoji">
                    <Smile />
                  </button>
                </div>
                <button type="button" className="publish-btn" disabled={!composerText.trim()} onClick={handlePublish}>
                  Publicar
                </button>
              </div>
            </section>

            {showSkeleton ? (
              <section className="skeleton-wrap" aria-label="Carregando feed">
                <article className="skeleton-card">
                  <div className="skeleton-line short" />
                  <div className="skeleton-line long" />
                  <div className="skeleton-line medium" />
                </article>
                <article className="skeleton-card">
                  <div className="skeleton-line short" />
                  <div className="skeleton-line long" />
                  <div className="skeleton-line medium" />
                </article>
              </section>
            ) : (
              <section className={`feed-list${tabAnimating ? ' tab-animate' : ''}${feedFlashing ? ' timeline-flash' : ''}`} aria-live="polite">
                {filteredPosts.length === 0 ? (
                  <div className="empty-feed">Nenhum post encontrado para este filtro.</div>
                ) : (
                  filteredPosts.map((post, index) => {
                    const isSearchMatch = Boolean(searchTerm.trim())

                    return (
                      <article
                        key={post.id}
                        data-post-id={post.id}
                        className={`post-card${isSearchMatch ? ' search-match' : ''}${showStagger ? ' stagger-in' : ''}${newPostId === post.id ? ' post-new' : ''}`}
                        style={{ ['--stagger' as string]: `${index * 80}ms` }}
                      >
                        <div className="post-avatar-wrap">
                          {post.thread ? <span className="thread-line" aria-hidden="true" /> : null}
                          <img className="post-avatar" src={post.avatar} alt={`Avatar de ${post.user}`} />
                        </div>

                        <div className="post-main">
                          <header className="post-head">
                            <span className="post-handle">{post.user}</span>
                            {post.verified ? <span className="verified-dot" aria-hidden="true" /> : null}
                            <span>•</span>
                            <time>{post.time}</time>
                          </header>

                          {post.repostInfo ? <div className="post-repost-info">{post.repostInfo}</div> : null}
                          <p className="post-text">{post.text}</p>

                          {post.poll ? (
                            <section className="poll-card" aria-label="Enquete">
                              {post.poll.options.map((option) => (
                                <div className="poll-option" key={option.label}>
                                  <div className="poll-label">
                                    <span>{option.label}</span>
                                    <strong>{option.pct}%</strong>
                                  </div>
                                  <div className="poll-track">
                                    <span className="poll-fill" style={{ width: pollBarsReady ? `${option.pct}%` : '0%' }} />
                                  </div>
                                </div>
                              ))}
                              <div className="poll-meta">
                                {post.poll.closed ? 'Encerrada' : 'Aberta'} • {post.poll.votes} voto{post.poll.votes > 1 ? 's' : ''}
                              </div>
                            </section>
                          ) : null}

                          {post.image ? <img className="post-image" src={post.image} alt="Imagem do post" loading="lazy" /> : null}

                          {post.repost ? (
                            <article className="nested-repost">
                              <div className="nested-head">
                                <strong>{post.repost.user}</strong>
                                <span>•</span>
                                <span>{post.repost.time}</span>
                              </div>
                              <p className="post-text">{post.repost.text}</p>
                              {post.repost.image ? (
                                <img className="post-image" src={post.repost.image} alt="Imagem do post original" loading="lazy" />
                              ) : null}
                            </article>
                          ) : null}

                          {post.threadNote ? <div className="thread-note">{post.threadNote}</div> : null}

                          <footer className="post-actions">
                            {(
                              [
                                {
                                  action: 'comment' as const,
                                  className: 'action-comment',
                                  icon: <MessageCircle />,
                                  count: post.metrics.comments,
                                  active: false,
                                },
                                {
                                  action: 'repost' as const,
                                  className: 'action-repost',
                                  icon: <Repeat2 />,
                                  count: post.metrics.reposts,
                                  active: post.state.repost,
                                },
                                {
                                  action: 'like' as const,
                                  className: 'action-like',
                                  icon: <Zap />,
                                  count: post.metrics.likes,
                                  active: post.state.like,
                                },
                                {
                                  action: 'share' as const,
                                  className: 'action-share',
                                  icon: <Share2 />,
                                  count: null,
                                  active: false,
                                },
                                {
                                  action: 'bookmark' as const,
                                  className: 'action-bookmark',
                                  icon: <Bookmark />,
                                  count: null,
                                  active: post.state.bookmark,
                                },
                              ] as const
                            ).map((item) => {
                              const key = `${post.id}-${item.action}`

                              return (
                                <button
                                  key={item.action}
                                  className={`action-btn ${item.className}${item.active ? ' active' : ''}${popKey === key ? ' pop' : ''}`}
                                  type="button"
                                  aria-label={item.action}
                                  onClick={() => handleToggleAction(post.id, item.action)}
                                >
                                  {item.icon}
                                  {item.count !== null ? <span className="action-count">{item.count}</span> : null}
                                </button>
                              )
                            })}
                          </footer>
                        </div>
                      </article>
                    )
                  })
                )}
              </section>
            )}
              </>
            ) : null}
          </section>

          <aside className="right-sidebar" aria-label="Hub de cordoes">
            <h2 className="section-title">:: HUB DE CORDOES</h2>
            <section className="panel hub-panel">
              <button className="create-thread-btn" type="button">
                Criar Cordao
              </button>
              <p className="sub-title">CORDOES POPULARES</p>
              <ul className="thread-list">
                {threadTags.map((item) => (
                  <li key={item.name} className="thread-item">
                    <span className="tag">{item.name}</span>
                    <span className="count">{item.count}</span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </main>

      <footer className="timeline-bar" aria-label="Timeline horizontal">
        <div className="timeline-inner">
          <span className="timeline-calendar" aria-hidden="true">
            <Calendar />
          </span>

          <div className="timeline-scroll" role="listbox" aria-label="Selecao de dias">
            {timelineDays.map((day) => (
              <button
                key={day.key}
                ref={day.isToday ? todayRef : null}
                className={`timeline-day${day.isToday ? ' today' : ''}${selectedDate === day.key ? ' selected' : ''}`}
                type="button"
                role="option"
                data-tooltip={`${day.activityCount} post${day.activityCount === 1 ? '' : 's'} neste dia`}
                onClick={() => {
                  setSelectedDate(day.key)

                  if (day.activityCount > 0) {
                    triggerFeedFlash()
                  }
                }}
              >
                <span className="timeline-avatars">
                  {day.avatars.slice(0, 3).map((seed, index) => (
                    <img
                      key={seed}
                      className="timeline-avatar"
                      src={`https://picsum.photos/seed/${seed}/24/24`}
                      alt="Atividade do dia"
                      style={{ left: `${16 + index * 12}px` }}
                      loading="lazy"
                    />
                  ))}
                </span>
                <span className="timeline-label">{day.label}</span>
              </button>
            ))}
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .echoframe-page {
          --color-bg: #080a12;
          --color-surface: #0f1120;
          --color-surface-2: #161929;
          --color-border: rgba(255, 255, 255, 0.08);
          --color-text: #e8eaf2;
          --color-text-muted: #7b80a0;
          --color-text-faint: #3d4160;
          --color-primary: #7c5af0;
          --color-primary-hover: #9370ff;
          --color-accent-teal: #00c4cc;
          --color-divider: rgba(255, 255, 255, 0.06);
          --color-like: #f3c75b;
          --color-badge: #ff5c60;
          --header-h: 52px;
          --timeline-h: 72px;
          --font-display: ${displayFont.style.fontFamily};
          --font-body: ${bodyFont.style.fontFamily};
          min-height: 100vh;
          position: relative;
          color: var(--color-text);
          font-family: var(--font-body);
          background-color: var(--color-bg);
          background-image:
            radial-gradient(circle at 15% 40%, rgba(108, 60, 220, 0.18) 0%, transparent 55%),
            radial-gradient(circle at 85% 30%, rgba(0, 180, 190, 0.14) 0%, transparent 50%);
          background-attachment: fixed;
          overflow-x: hidden;
          line-height: 1.45;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        .echoframe-page * {
          box-sizing: border-box;
        }

        .echoframe-page a {
          color: inherit;
          text-decoration: none;
        }

        .echoframe-page button,
        .echoframe-page input,
        .echoframe-page textarea {
          font: inherit;
          color: inherit;
        }

        .echoframe-page textarea {
          resize: none;
        }

        .echoframe-page :focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }

        .echoframe-page .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .echoframe-page .bg-particles {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .echoframe-page .bg-particles span {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.15);
        }

        .echoframe-page .bg-particles span:nth-child(1) { top: 12%; left: 14%; }
        .echoframe-page .bg-particles span:nth-child(2) { top: 22%; left: 65%; }
        .echoframe-page .bg-particles span:nth-child(3) { top: 36%; left: 31%; }
        .echoframe-page .bg-particles span:nth-child(4) { top: 52%; left: 86%; }
        .echoframe-page .bg-particles span:nth-child(5) { top: 62%; left: 44%; }
        .echoframe-page .bg-particles span:nth-child(6) { top: 74%; left: 11%; }
        .echoframe-page .bg-particles span:nth-child(7) { top: 80%; left: 70%; }
        .echoframe-page .bg-particles span:nth-child(8) { top: 28%; left: 90%; }

        .echoframe-page .top-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: var(--header-h);
          border-bottom: 1px solid var(--color-border);
          background: rgba(8, 10, 18, 0.85);
          backdrop-filter: blur(16px);
          z-index: 100;
        }

        .echoframe-page .header-inner {
          max-width: 1340px;
          height: 100%;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          position: relative;
          z-index: 2;
        }

        .echoframe-page .brand-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .echoframe-page .brand-link span {
          font-family: var(--font-display);
          font-size: 14px;
          letter-spacing: 0.03em;
          color: var(--color-text);
        }

        .echoframe-page .logo-mark {
          width: 28px;
          height: 28px;
          display: block;
          flex-shrink: 0;
        }

        .echoframe-page .search-slot {
          flex: 1;
          display: flex;
          justify-content: center;
          min-width: 0;
        }

        .echoframe-page .search-wrap {
          width: 360px;
          max-width: 100%;
          position: relative;
          transition: transform 0.2s ease;
        }

        .echoframe-page .search-wrap input {
          width: 100%;
          height: 36px;
          border-radius: 999px;
          border: 1px solid var(--color-border);
          background: var(--color-surface-2);
          color: var(--color-text);
          padding: 0 38px 0 14px;
          font-size: 13px;
        }

        .echoframe-page .search-wrap input::placeholder {
          color: var(--color-text-faint);
        }

        .echoframe-page .search-wrap svg {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: var(--color-text-muted);
          pointer-events: none;
        }

        .echoframe-page .search-wrap:focus-within {
          transform: scale(1.02);
        }

        .echoframe-page .search-wrap:focus-within input {
          border-color: rgba(124, 90, 240, 0.7);
          box-shadow: 0 0 0 1px rgba(124, 90, 240, 0.32);
        }

        .echoframe-page .header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: auto;
          flex-shrink: 0;
        }

        .echoframe-page .icon-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--color-text-muted);
          display: inline-grid;
          place-items: center;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
          position: relative;
        }

        .echoframe-page .icon-btn svg {
          width: 18px;
          height: 18px;
          stroke-width: 1.8;
        }

        .echoframe-page .icon-btn:hover {
          color: var(--color-text);
          border-color: var(--color-border);
          background: var(--color-surface-2);
        }

        .echoframe-page .notif-badge {
          position: absolute;
          top: 3px;
          right: 3px;
          min-width: 14px;
          height: 14px;
          border-radius: 99px;
          background: var(--color-badge);
          color: #fff;
          font-size: 10px;
          line-height: 14px;
          text-align: center;
          font-weight: 600;
          padding: 0 3px;
          font-family: var(--font-display);
        }

        .echoframe-page .profile-chip {
          height: 34px;
          border-radius: 999px;
          border: 1px solid var(--color-border);
          padding: 0 8px 0 4px;
          background: var(--color-surface);
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          color: var(--color-text-muted);
          transition: border-color 0.2s ease, color 0.2s ease;
        }

        .echoframe-page .profile-chip:hover {
          color: var(--color-text);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .echoframe-page .profile-chip img {
          width: 24px;
          height: 24px;
          border-radius: 999px;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.16);
        }

        .echoframe-page .profile-chip span {
          font-size: 12px;
          font-weight: 500;
        }

        .echoframe-page .profile-chip svg {
          width: 14px;
          height: 14px;
          transition: transform 0.2s ease;
        }

        .echoframe-page .top-header,
        .echoframe-page .top-header * {
          pointer-events: auto;
        }

        .echoframe-page .header-action-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .echoframe-page .header-action-btn,
        .echoframe-page .header-profile-btn {
          position: relative;
          z-index: 2;
          cursor: pointer;
        }

        .echoframe-page .icon-btn.is-active,
        .echoframe-page .profile-chip.is-open {
          color: var(--color-text);
          border-color: rgba(255, 255, 255, 0.16);
          background: var(--color-surface-2);
        }

        .echoframe-page .profile-chip.is-open svg {
          transform: rotate(180deg);
        }

        .echoframe-page .header-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          border: 1px solid var(--color-border);
          background: rgba(10, 12, 24, 0.98);
          border-radius: 12px;
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.5);
          opacity: 0;
          pointer-events: none;
          transform: translateY(8px) scale(0.98);
          transition: opacity 0.18s ease, transform 0.18s ease;
          z-index: 240;
        }

        .echoframe-page .header-dropdown.is-open {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0) scale(1);
        }

        .echoframe-page .notif-dropdown {
          width: min(320px, calc(100vw - 24px));
          right: -80px;
          overflow: hidden;
        }

        .echoframe-page .notif-dropdown-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 12px 12px 10px;
          border-bottom: 1px solid var(--color-divider);
        }

        .echoframe-page .notif-dropdown-head h4 {
          margin: 0;
          font-size: 14px;
          color: var(--color-text);
        }

        .echoframe-page .mark-read-btn {
          border: 0;
          background: transparent;
          color: var(--color-primary-hover);
          font-size: 11px;
          cursor: pointer;
        }

        .echoframe-page .notif-dropdown-list {
          margin: 0;
          padding: 6px;
          list-style: none;
          max-height: 290px;
          overflow-y: auto;
          display: grid;
          gap: 4px;
        }

        .echoframe-page .notif-dropdown-item {
          display: grid;
          gap: 3px;
          padding: 8px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: rgba(255, 255, 255, 0.02);
        }

        .echoframe-page .notif-dropdown-item.unread {
          border-color: rgba(124, 90, 240, 0.35);
          background: rgba(124, 90, 240, 0.09);
        }

        .echoframe-page .notif-dropdown-body {
          color: var(--color-text-muted);
          font-size: 12px;
          line-height: 1.4;
        }

        .echoframe-page .notif-dropdown-body strong {
          color: var(--color-text);
        }

        .echoframe-page .notif-dropdown-time {
          color: var(--color-text-faint);
          font-size: 11px;
        }

        .echoframe-page .profile-wrap {
          margin-left: 2px;
        }

        .echoframe-page .profile-menu-dropdown {
          width: 220px;
          padding: 6px;
          right: 0;
          display: grid;
          gap: 4px;
        }

        .echoframe-page .profile-menu-item {
          border: 0;
          background: transparent;
          color: var(--color-text-muted);
          border-radius: 8px;
          text-align: left;
          padding: 9px 10px;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.18s ease, color 0.18s ease;
        }

        .echoframe-page .profile-menu-item:hover {
          background: rgba(255, 255, 255, 0.07);
          color: var(--color-text);
        }

        .echoframe-page .profile-menu-item.logout-item {
          color: #ff8e92;
        }

        .echoframe-page .header-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.35);
          opacity: 0;
          pointer-events: none;
          z-index: 145;
          transition: opacity 0.16s ease;
        }

        .echoframe-page .header-overlay.is-visible {
          opacity: 1;
          pointer-events: auto;
        }

        .echoframe-page .header-drawer {
          position: fixed;
          top: var(--header-h);
          right: 0;
          width: min(360px, 100vw);
          height: calc(100vh - var(--header-h) - var(--timeline-h));
          border-left: 1px solid var(--color-border);
          background: rgba(8, 10, 18, 0.98);
          backdrop-filter: blur(22px);
          transform: translateX(108%);
          pointer-events: none;
          transition: transform 0.24s ease;
          z-index: 160;
          display: grid;
          grid-template-rows: auto auto minmax(0, 1fr);
        }

        .echoframe-page .header-drawer.is-open {
          transform: translateX(0);
          pointer-events: auto;
        }

        .echoframe-page .drawer-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 14px 14px 10px;
          border-bottom: 1px solid var(--color-divider);
        }

        .echoframe-page .drawer-head h3 {
          margin: 0;
          font-size: 14px;
          color: var(--color-text);
        }

        .echoframe-page .drawer-close-btn {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: 0;
          background: transparent;
          color: var(--color-text-muted);
          cursor: pointer;
        }

        .echoframe-page .drawer-close-btn:hover {
          color: var(--color-text);
          background: rgba(255, 255, 255, 0.08);
        }

        .echoframe-page .bookmark-tabs {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 12px;
          border-bottom: 1px solid var(--color-divider);
          overflow-x: auto;
        }

        .echoframe-page .bookmark-tab {
          height: 30px;
          border-radius: 999px;
          border: 1px solid var(--color-border);
          background: transparent;
          color: var(--color-text-muted);
          padding: 0 12px;
          font-size: 12px;
          cursor: pointer;
          white-space: nowrap;
        }

        .echoframe-page .bookmark-tab.active {
          background: rgba(124, 90, 240, 0.2);
          color: var(--color-text);
          border-color: rgba(124, 90, 240, 0.5);
        }

        .echoframe-page .saved-list {
          margin: 0;
          padding: 10px;
          list-style: none;
          overflow-y: auto;
          display: grid;
          gap: 8px;
        }

        .echoframe-page .saved-item {
          border: 1px solid var(--color-border);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.03);
          padding: 8px;
          display: grid;
          grid-template-columns: 36px minmax(0, 1fr) auto;
          gap: 8px;
          align-items: center;
        }

        .echoframe-page .saved-item img {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.16);
        }

        .echoframe-page .saved-copy {
          min-width: 0;
        }

        .echoframe-page .saved-copy strong {
          display: block;
          color: var(--color-text);
          font-size: 12px;
        }

        .echoframe-page .saved-copy p {
          margin: 2px 0 0;
          color: var(--color-text-muted);
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .echoframe-page .saved-remove-btn {
          border: 0;
          background: transparent;
          color: var(--color-text-faint);
          font-size: 11px;
          cursor: pointer;
        }

        .echoframe-page .saved-remove-btn:hover {
          color: #ff8e92;
        }

        .echoframe-page .saved-empty {
          padding: 16px;
          color: var(--color-text-muted);
          font-size: 12px;
          text-align: center;
        }

        .echoframe-page .settings-overlay,
        .echoframe-page .logout-overlay {
          position: fixed;
          inset: 0;
          z-index: 300;
          display: grid;
          place-items: center;
          padding: 16px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.18s ease;
        }

        .echoframe-page .settings-overlay {
          background: rgba(8, 10, 18, 0.86);
        }

        .echoframe-page .logout-overlay {
          background: rgba(8, 10, 18, 0.52);
        }

        .echoframe-page .settings-overlay.is-open,
        .echoframe-page .logout-overlay.is-open {
          opacity: 1;
          pointer-events: auto;
        }

        .echoframe-page .settings-card,
        .echoframe-page .logout-dialog {
          width: min(420px, calc(100vw - 24px));
          border: 1px solid var(--color-border);
          border-radius: 14px;
          background: rgba(12, 14, 26, 0.98);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55);
          padding: 16px;
          display: grid;
          gap: 10px;
        }

        .echoframe-page .settings-card h3,
        .echoframe-page .logout-dialog p {
          margin: 0;
          color: var(--color-text);
          font-size: 18px;
          font-family: var(--font-display);
        }

        .echoframe-page .settings-card p,
        .echoframe-page .logout-subtitle {
          color: var(--color-text-muted);
          font-size: 13px;
        }

        .echoframe-page .settings-grid {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 6px;
        }

        .echoframe-page .settings-grid li {
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 12px;
          color: var(--color-text-muted);
          background: rgba(255, 255, 255, 0.03);
        }

        .echoframe-page .settings-back-btn {
          justify-self: end;
          border: 1px solid var(--color-border);
          border-radius: 999px;
          background: transparent;
          color: var(--color-text);
          padding: 6px 12px;
          cursor: pointer;
        }

        .echoframe-page .settings-back-btn:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .echoframe-page .logout-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .echoframe-page .logout-actions button {
          border: 0;
          border-radius: 999px;
          padding: 7px 14px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .echoframe-page .logout-cancel {
          background: rgba(255, 255, 255, 0.08);
          color: var(--color-text);
        }

        .echoframe-page .logout-confirm {
          background: #ff5c60;
          color: #fff;
        }

        .echoframe-page .view-card {
          border: 1px solid var(--color-border);
          border-radius: 14px;
          background: var(--color-surface);
          padding: 16px;
          display: grid;
          gap: 12px;
          margin-bottom: 12px;
        }

        .echoframe-page .view-card h3 {
          margin: 0;
          color: var(--color-text);
          font-family: var(--font-display);
        }

        .echoframe-page .view-card p {
          margin: 0;
          color: var(--color-text-muted);
          font-size: 13px;
        }

        .echoframe-page .profile-view-meta {
          color: var(--color-text-faint);
          font-size: 12px;
        }

        .echoframe-page .profile-view-list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 6px;
        }

        .echoframe-page .profile-view-list li {
          padding: 8px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.04);
          color: var(--color-text-muted);
          font-size: 12px;
        }

        .echoframe-page .view-card-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .echoframe-page .ghost-btn {
          border: 1px solid var(--color-border);
          border-radius: 999px;
          background: transparent;
          color: var(--color-text);
          font-size: 12px;
          padding: 7px 12px;
          cursor: pointer;
        }

        .echoframe-page .ghost-btn:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .echoframe-page .feed-column.feed--compact .composer {
          padding: 10px;
        }

        .echoframe-page .feed-column.feed--compact .post-card {
          grid-template-columns: 34px minmax(0, 1fr);
          padding: 10px;
          gap: 8px;
        }

        .echoframe-page .feed-column.feed--compact .post-avatar,
        .echoframe-page .feed-column.feed--compact .post-avatar-wrap {
          width: 34px;
          height: 34px;
        }

        .echoframe-page .feed-column.feed--compact .post-text {
          font-size: 13px;
        }

        .echoframe-page .app-main {
          position: relative;
          z-index: 1;
          padding-top: var(--header-h);
          padding-bottom: var(--timeline-h);
        }

        .echoframe-page .columns {
          max-width: 1340px;
          margin: 0 auto;
          padding: 14px 16px 28px;
          display: grid;
          grid-template-columns: 260px minmax(0, 640px) 280px;
          justify-content: center;
          gap: 16px;
        }

        .echoframe-page .left-sidebar,
        .echoframe-page .right-sidebar {
          position: sticky;
          top: var(--header-h);
          max-height: calc(100vh - 124px);
          overflow-y: auto;
          padding-right: 2px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.08) transparent;
        }

        .echoframe-page .left-sidebar::-webkit-scrollbar,
        .echoframe-page .right-sidebar::-webkit-scrollbar {
          width: 7px;
        }

        .echoframe-page .left-sidebar::-webkit-scrollbar-thumb,
        .echoframe-page .right-sidebar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .echoframe-page .section-title {
          margin: 6px 0 10px;
          font-size: 12px;
          letter-spacing: 0.08em;
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          font-family: var(--font-body);
        }

        .echoframe-page .panel {
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          border-radius: 14px;
        }

        .echoframe-page .popular-list {
          overflow: hidden;
        }

        .echoframe-page .popular-post {
          padding: 12px;
          display: grid;
          gap: 8px;
        }

        .echoframe-page .popular-post + .popular-post {
          border-top: 1px solid var(--color-divider);
        }

        .echoframe-page .mini-head {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .echoframe-page .mini-head img {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.16);
          flex-shrink: 0;
        }

        .echoframe-page .mini-user {
          min-width: 0;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--color-text-muted);
        }

        .echoframe-page .mini-user b {
          font-weight: 600;
          color: var(--color-text);
        }

        .echoframe-page .mini-repost {
          font-size: 11px;
          color: var(--color-text-faint);
          margin: 0;
        }

        .echoframe-page .mini-text {
          margin: 0;
          font-size: 13px;
          color: var(--color-text);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .echoframe-page .mini-poll {
          display: grid;
          gap: 5px;
        }

        .echoframe-page .mini-poll-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--color-text-muted);
        }

        .echoframe-page .mini-poll-bar {
          flex: 1;
          height: 5px;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.06);
          overflow: hidden;
        }

        .echoframe-page .mini-poll-bar span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: rgba(124, 90, 240, 0.65);
        }

        .echoframe-page .mini-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          color: var(--color-text-faint);
        }

        .echoframe-page .mini-actions svg {
          width: 13px;
          height: 13px;
          stroke-width: 1.9;
        }

        .echoframe-page .feed-column {
          min-width: 0;
        }

        .echoframe-page .tabs-row {
          position: sticky;
          top: var(--header-h);
          z-index: 90;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          margin-bottom: 12px;
          border: 1px solid var(--color-border);
          border-bottom-color: var(--color-divider);
          border-radius: 14px;
          background: rgba(15, 17, 32, 0.94);
          backdrop-filter: blur(10px);
        }

        .echoframe-page .feed-tab {
          height: 30px;
          border: 0;
          border-radius: 999px;
          padding: 0 16px;
          background: transparent;
          color: var(--color-text-muted);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s ease, background 0.2s ease;
        }

        .echoframe-page .feed-tab:hover {
          color: var(--color-text);
        }

        .echoframe-page .feed-tab.active {
          background: var(--color-primary);
          color: #fff;
          font-weight: 600;
          font-family: var(--font-display);
        }

        .echoframe-page .composer {
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          border-radius: 14px;
          padding: 14px;
          margin-bottom: 12px;
        }

        .echoframe-page .composer-top {
          display: grid;
          grid-template-columns: 32px minmax(0, 1fr);
          gap: 10px;
          align-items: start;
        }

        .echoframe-page .composer-top img {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        .echoframe-page .composer textarea {
          width: 100%;
          min-height: 54px;
          max-height: 220px;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--color-text);
          font-size: 14px;
          line-height: 1.45;
          padding: 6px 0;
          overflow: hidden;
        }

        .echoframe-page .composer textarea::placeholder {
          color: var(--color-text-faint);
        }

        .echoframe-page .composer-bottom {
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .echoframe-page .composer-tools {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .echoframe-page .composer-tools .icon-btn {
          width: 30px;
          height: 30px;
          border-radius: 8px;
        }

        .echoframe-page .composer-tools .icon-btn svg {
          width: 15px;
          height: 15px;
        }

        .echoframe-page .publish-btn {
          min-width: 98px;
          height: 34px;
          border: 0;
          border-radius: 999px;
          background: var(--color-primary);
          color: #fff;
          font-weight: 600;
          font-family: var(--font-display);
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
        }

        .echoframe-page .publish-btn:hover:enabled {
          background: var(--color-primary-hover);
          transform: translateY(-1px);
        }

        .echoframe-page .publish-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .echoframe-page .feed-list {
          display: grid;
          gap: 12px;
          margin-top: 0;
        }

        .echoframe-page .feed-list.timeline-flash {
          animation: feedPulse 300ms ease;
        }

        .echoframe-page .feed-list.tab-animate {
          animation: tabShift 280ms ease;
        }

        @keyframes feedPulse {
          0% { opacity: 1; }
          45% { opacity: 0.45; }
          100% { opacity: 1; }
        }

        @keyframes tabShift {
          0% { opacity: 0.5; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .echoframe-page .post-card {
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          border-radius: 14px;
          padding: 13px;
          display: grid;
          grid-template-columns: 40px minmax(0, 1fr);
          gap: 11px;
          transition: border-color 0.2s ease, background 0.2s ease;
          position: relative;
          opacity: 1;
          transform: translateY(0);
        }

        .echoframe-page .post-card.search-match {
          border-color: rgba(124, 90, 240, 0.42);
          background: linear-gradient(180deg, rgba(124, 90, 240, 0.08), rgba(15, 17, 32, 0.96));
        }

        .echoframe-page .post-card.stagger-in {
          opacity: 0;
          transform: translateY(10px);
          animation: postReveal 420ms ease forwards;
          animation-delay: var(--stagger, 0ms);
        }

        .echoframe-page .post-card.post-new {
          animation: postSlideDown 300ms ease;
        }

        @keyframes postReveal {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes postSlideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .echoframe-page .post-avatar-wrap {
          position: relative;
          width: 40px;
        }

        .echoframe-page .thread-line {
          position: absolute;
          left: 19px;
          top: -10px;
          bottom: -10px;
          width: 2px;
          border-radius: 99px;
          background: rgba(124, 90, 240, 0.75);
        }

        .echoframe-page .post-avatar {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.16);
          position: relative;
          z-index: 1;
          background: #101325;
        }

        .echoframe-page .post-main {
          min-width: 0;
        }

        .echoframe-page .post-head {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          font-size: 13px;
          color: var(--color-text-muted);
        }

        .echoframe-page .post-handle {
          font-weight: 600;
          color: var(--color-text);
        }

        .echoframe-page .verified-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: linear-gradient(180deg, #ff7a50, #ff4d4f);
          box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.18);
          display: inline-block;
          transform: translateY(-1px);
        }

        .echoframe-page .post-repost-info {
          margin-top: 2px;
          margin-bottom: 5px;
          font-size: 11px;
          color: var(--color-text-faint);
        }

        .echoframe-page .post-text {
          margin: 0;
          font-size: 14px;
          color: var(--color-text);
          white-space: pre-wrap;
          word-break: break-word;
        }

        .echoframe-page .post-image {
          margin-top: 10px;
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          display: block;
          max-height: 320px;
          object-fit: cover;
          background: var(--color-surface-2);
        }

        .echoframe-page .poll-card {
          margin-top: 10px;
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 10px;
          display: grid;
          gap: 8px;
          background: rgba(22, 25, 41, 0.35);
        }

        .echoframe-page .poll-option {
          display: grid;
          gap: 4px;
        }

        .echoframe-page .poll-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--color-text-muted);
        }

        .echoframe-page .poll-track {
          width: 100%;
          height: 8px;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.06);
          overflow: hidden;
        }

        .echoframe-page .poll-fill {
          width: 0;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, rgba(124, 90, 240, 0.95), rgba(147, 112, 255, 0.95));
          transition: width 520ms cubic-bezier(0.2, 0.9, 0.3, 1);
        }

        .echoframe-page .poll-meta {
          font-size: 11px;
          color: var(--color-text-faint);
        }

        .echoframe-page .nested-repost {
          margin-top: 10px;
          border: 1px solid var(--color-border);
          background: rgba(22, 25, 41, 0.28);
          border-radius: 12px;
          padding: 10px;
          display: grid;
          gap: 6px;
        }

        .echoframe-page .nested-head {
          font-size: 12px;
          color: var(--color-text-muted);
          display: flex;
          gap: 6px;
          align-items: center;
          flex-wrap: wrap;
        }

        .echoframe-page .thread-note {
          margin-top: 7px;
          font-size: 12px;
          color: var(--color-text-muted);
          border-left: 2px solid rgba(124, 90, 240, 0.55);
          padding-left: 8px;
        }

        .echoframe-page .post-actions {
          margin-top: 10px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px 12px;
        }

        .echoframe-page .action-btn {
          border: 0;
          background: transparent;
          color: var(--color-text-faint);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 2px;
          border-radius: 8px;
          cursor: pointer;
          transition: color 0.2s ease, transform 0.2s ease;
          font-size: 12px;
        }

        .echoframe-page .action-btn svg {
          width: 15px;
          height: 15px;
          stroke-width: 1.9;
        }

        .echoframe-page .action-count {
          min-width: 10px;
          text-align: left;
          color: var(--color-text-muted);
          font-size: 11px;
        }

        .echoframe-page .action-comment:hover,
        .echoframe-page .action-comment.active {
          color: var(--color-primary);
        }

        .echoframe-page .action-repost:hover,
        .echoframe-page .action-repost.active {
          color: var(--color-accent-teal);
        }

        .echoframe-page .action-like:hover,
        .echoframe-page .action-like.active {
          color: var(--color-like);
        }

        .echoframe-page .action-share:hover,
        .echoframe-page .action-share.active {
          color: var(--color-text-muted);
        }

        .echoframe-page .action-bookmark:hover,
        .echoframe-page .action-bookmark.active {
          color: var(--color-primary);
        }

        .echoframe-page .action-bookmark.active svg {
          fill: currentColor;
          stroke: currentColor;
        }

        .echoframe-page .action-btn.active .action-count {
          color: currentColor;
        }

        .echoframe-page .action-btn.pop {
          animation: btnPop 220ms ease;
        }

        @keyframes btnPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        .echoframe-page .empty-feed {
          border: 1px solid var(--color-border);
          border-radius: 14px;
          background: var(--color-surface);
          padding: 22px;
          text-align: center;
          color: var(--color-text-muted);
          font-size: 13px;
        }

        .echoframe-page .skeleton-wrap {
          display: grid;
          gap: 12px;
        }

        .echoframe-page .skeleton-card {
          border: 1px solid var(--color-border);
          border-radius: 14px;
          background: var(--color-surface);
          padding: 13px;
          min-height: 120px;
          position: relative;
          overflow: hidden;
        }

        .echoframe-page .skeleton-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(100deg, transparent 15%, rgba(255, 255, 255, 0.05) 45%, transparent 75%);
          transform: translateX(-100%);
          animation: shimmer 1.2s infinite;
        }

        .echoframe-page .skeleton-line {
          height: 11px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.06);
          margin-bottom: 9px;
        }

        .echoframe-page .skeleton-line.short { width: 34%; }
        .echoframe-page .skeleton-line.medium { width: 58%; }
        .echoframe-page .skeleton-line.long { width: 88%; }

        @keyframes shimmer {
          to {
            transform: translateX(100%);
          }
        }

        .echoframe-page .hub-panel {
          padding: 12px;
          display: grid;
          gap: 12px;
        }

        .echoframe-page .create-thread-btn {
          width: 100%;
          border: 0;
          border-radius: 8px;
          height: 40px;
          background: var(--color-primary);
          color: #fff;
          font-weight: 600;
          font-family: var(--font-display);
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .echoframe-page .create-thread-btn:hover {
          background: var(--color-primary-hover);
        }

        .echoframe-page .sub-title {
          margin: 0;
          font-size: 11px;
          color: var(--color-text-muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 600;
        }

        .echoframe-page .thread-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 6px;
        }

        .echoframe-page .thread-item {
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: rgba(15, 17, 32, 0.45);
          padding: 8px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          color: var(--color-text-muted);
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }

        .echoframe-page .thread-item:hover {
          background: var(--color-surface-2);
          color: var(--color-text);
          border-color: rgba(255, 255, 255, 0.14);
        }

        .echoframe-page .thread-item .tag {
          color: var(--color-text);
          font-weight: 500;
        }

        .echoframe-page .thread-item .count {
          min-width: 20px;
          text-align: center;
          border-radius: 999px;
          padding: 2px 7px;
          font-size: 11px;
          background: rgba(124, 90, 240, 0.15);
          border: 1px solid rgba(124, 90, 240, 0.35);
          color: #d7cdfc;
        }

        .echoframe-page .timeline-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: var(--timeline-h);
          border-top: 1px solid var(--color-border);
          background: rgba(8, 10, 18, 0.92);
          backdrop-filter: blur(20px);
          z-index: 200;
        }

        .echoframe-page .timeline-inner {
          max-width: 1340px;
          margin: 0 auto;
          height: 100%;
          padding: 0 16px;
          display: flex;
          align-items: center;
          position: relative;
        }

        .echoframe-page .timeline-calendar {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          border-radius: 999px;
          border: 1px solid var(--color-border);
          background: rgba(15, 17, 32, 0.65);
          color: var(--color-text-muted);
          display: inline-grid;
          place-items: center;
          pointer-events: none;
        }

        .echoframe-page .timeline-calendar svg {
          width: 16px;
          height: 16px;
          stroke-width: 1.8;
        }

        .echoframe-page .timeline-scroll {
          width: 100%;
          margin-left: 0;
          padding-left: 64px;
          padding-right: 8px;
          display: flex;
          align-items: center;
          gap: 0;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .echoframe-page .timeline-scroll::-webkit-scrollbar {
          display: none;
        }

        .echoframe-page .timeline-day {
          min-width: 90px;
          padding: 8px 0;
          border: 1px solid transparent;
          border-radius: 10px;
          background: transparent;
          color: var(--color-text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
          scroll-snap-align: center;
          position: relative;
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .echoframe-page .timeline-day:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .echoframe-page .timeline-day.today {
          background: rgba(124, 90, 240, 0.15);
          border-color: rgba(124, 90, 240, 0.3);
        }

        .echoframe-page .timeline-day.today .timeline-label {
          color: var(--color-primary);
          font-weight: 700;
        }

        .echoframe-page .timeline-day.selected {
          border-color: rgba(124, 90, 240, 0.75);
          box-shadow: inset 0 0 0 1px rgba(124, 90, 240, 0.22);
        }

        .echoframe-page .timeline-day::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: calc(100% + 7px);
          left: 50%;
          transform: translate(-50%, 6px);
          font-size: 10px;
          color: var(--color-text);
          background: rgba(15, 17, 32, 0.95);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 4px 6px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.18s ease, transform 0.18s ease;
          z-index: 5;
        }

        .echoframe-page .timeline-day:hover::after {
          opacity: 1;
          transform: translate(-50%, 0);
        }

        .echoframe-page .timeline-avatars {
          width: 56px;
          height: 28px;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .echoframe-page .timeline-avatar {
          position: absolute;
          top: 2px;
          width: 24px;
          height: 24px;
          border-radius: 999px;
          object-fit: cover;
          border: 2px solid var(--color-primary);
          background: #111426;
        }

        .echoframe-page .timeline-label {
          font-size: 11px;
          color: var(--color-text-muted);
          line-height: 1;
          text-align: center;
        }

        @media (max-width: 1023px) {
          .echoframe-page .columns {
            grid-template-columns: minmax(0, 640px) 280px;
          }

          .echoframe-page .left-sidebar {
            display: none;
          }
        }

        @media (max-width: 767px) {
          .echoframe-page .columns {
            grid-template-columns: minmax(0, 1fr);
            max-width: 720px;
          }

          .echoframe-page .left-sidebar,
          .echoframe-page .right-sidebar {
            display: none;
          }

          .echoframe-page .search-slot {
            display: none;
          }

          .echoframe-page .mobile-hide {
            display: none;
          }

          .echoframe-page .header-inner {
            padding: 0 10px;
            gap: 8px;
          }

          .echoframe-page .notif-dropdown {
            right: -22px;
            width: min(92vw, 320px);
          }

          .echoframe-page .profile-menu-dropdown {
            right: 0;
            width: min(86vw, 220px);
          }

          .echoframe-page .header-drawer {
            width: 100%;
          }

          .echoframe-page .view-card-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .echoframe-page .tabs-row {
            top: var(--header-h);
          }

          .echoframe-page .feed-tab {
            padding: 0 12px;
            font-size: 12px;
          }

          .echoframe-page .timeline-scroll {
            padding-left: 58px;
          }

          .echoframe-page .timeline-day {
            min-width: 70px;
          }

          .echoframe-page .timeline-label {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  )
}
