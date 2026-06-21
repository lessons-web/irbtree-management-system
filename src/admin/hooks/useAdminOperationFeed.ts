import { useCallback, useState } from 'react'
import { adminNotificationSeed } from '../config/navigation'
import { logRows } from '../data'
import type {
  AdminOperationInput,
  AdminOperationLog,
  AdminOperationNotification,
} from '../types/admin'

const maxNotifications = 8

function formatDateTime(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

function buildSearchText(log: AdminOperationLog) {
  return `${log.module} ${log.actor} ${log.action} ${log.status}`.trim()
}

function buildNotification(operation: AdminOperationInput, now: Date): AdminOperationNotification {
  return {
    id: `notification-${now.getTime()}`,
    title: operation.title,
    description: operation.description,
    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
  }
}

function buildLog(operation: AdminOperationInput, now: Date): AdminOperationLog {
  const log: AdminOperationLog = {
    id: `log-${now.getTime()}`,
    module: operation.module,
    actor: operation.actor ?? 'Admin User',
    action: operation.action,
    createdAt: formatDateTime(now),
    status: operation.status ?? '成功',
    statusTone: operation.statusTone ?? 'success',
    searchText: '',
  }

  return {
    ...log,
    searchText: buildSearchText(log),
  }
}

export function useAdminOperationFeed() {
  const [notifications, setNotifications] = useState<AdminOperationNotification[]>(adminNotificationSeed)
  const [logs, setLogs] = useState<AdminOperationLog[]>(logRows)

  const appendOperation = useCallback((operation: AdminOperationInput) => {
    const now = new Date()
    const notification = buildNotification(operation, now)
    const log = buildLog(operation, now)

    setNotifications((current) => [notification, ...current].slice(0, maxNotifications))
    setLogs((current) => [log, ...current])
  }, [])

  return {
    notifications,
    logs,
    appendOperation,
  }
}
