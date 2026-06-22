export { adminDefaultPath, adminNavGroups, adminPageTitles, getAdminPageTitle } from './navigationGroups'

export const adminNotificationSeed = [
  {
    id: 'notification-review-risk',
    title: '评价治理待处理',
    description: 'COMP9021 收到 3 条需要复核的新评价，请尽快处理。',
    time: '2 分钟前',
  },
  {
    id: 'notification-course-created',
    title: '课程信息已更新',
    description: '课程 COMP9311 的任课老师与课程简介已同步更新。',
    time: '30 分钟前',
  },
  {
    id: 'notification-message-published',
    title: '系统消息已发布',
    description: '2026 T2 选课季提醒已成功发送至全部用户。',
    time: '今天 09:40',
  },
]
