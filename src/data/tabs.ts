// ============================================================
// Navigation tab definitions
// ============================================================

import { Tab } from '../context/AppContext'

export interface TabDef {
  id: Tab
  labelCn: string
  labelEn: string
  icon: string            // FontAwesome class
  color: string           // accent colour for this module
  colorLight: string      // light version for backgrounds
}

export const TABS: TabDef[] = [
  {
    id: 'vocab',
    labelCn: '生字表',
    labelEn: 'Vocab',
    icon: 'fa-solid fa-book',
    color: 'var(--color-primary)',
    colorLight: '#FFEBEE',
  },
  {
    id: 'flashcard',
    labelCn: '闪卡',
    labelEn: 'Flashcard',
    icon: 'fa-solid fa-clone',
    color: '#D81B60',
    colorLight: '#FCE4EC',
  },
  {
    id: 'games',
    labelCn: '游戏',
    labelEn: 'Games',
    icon: 'fa-solid fa-gamepad',
    color: '#7B1FA2',
    colorLight: '#F3E5F5',
  },
  {
    id: 'composition',
    labelCn: '作文',
    labelEn: 'Compose',
    icon: 'fa-solid fa-pencil',
    color: '#1565C0',
    colorLight: '#E3F2FD',
  },
  {
    id: 'oral',
    labelCn: '口试',
    labelEn: 'Oral',
    icon: 'fa-solid fa-microphone',
    color: '#00695C',
    colorLight: '#E0F2F1',
  },
  {
    id: 'tools',
    labelCn: '工具',
    labelEn: 'Tools',
    icon: 'fa-solid fa-toolbox',
    color: '#E65100',
    colorLight: '#FFF3E0',
  },
  {
    id: 'profile',
    labelCn: '我的',
    labelEn: 'My',
    icon: 'fa-solid fa-user-circle',
    color: '#4527A0',
    colorLight: '#EDE7F6',
  },
]

export const getTabDef = (id: Tab): TabDef | undefined =>
  TABS.find(t => t.id === id)
