import { Outlet } from 'react-router'
import FloatingConsultButton from '../components/user/FloatingConsultButton'
import { UserOverlayProvider } from '../components/user/UserOverlayContext'
import UserFooter from '../components/user/UserFooter'
import UserHeader from '../components/user/UserHeader'
import { useUserOverlay } from '../components/user/useUserOverlay'

export default function UserLayout() {
  return (
    <UserOverlayProvider>
      <UserLayoutContent />
    </UserOverlayProvider>
  )
}

function UserLayoutContent() {
  const { openCompleted } = useUserOverlay()
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <UserHeader onOpenCompleted={openCompleted} />
      <main className="w-full flex-1">
        <Outlet />
      </main>
      <UserFooter />
      <FloatingConsultButton />
    </div>
  )
}
