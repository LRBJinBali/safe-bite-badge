export type VisitStage = 'received' | 'scheduled' | 'assessed'

export const VISIT_STAGES: { key: VisitStage, title: string, text: string, icon: string }[] = [
  { key: 'received', title: '已收到', text: '申請已記下來了。', icon: 'i-lucide-inbox' },
  { key: 'scheduled', title: '已排定訪視', text: '輔導人員排好時間,會到攤位陪你檢查。', icon: 'i-lucide-calendar-check' },
  { key: 'assessed', title: '已完成訪視', text: '訪視完成。真正的結果和下一步,會由衛生局另行通知,這裡不顯示。', icon: 'i-lucide-flag' },
]

export const visitStatusZh = (s: VisitStage) => VISIT_STAGES.find(x => x.key === s)!.title
