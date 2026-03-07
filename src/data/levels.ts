// ============================================================
// Level definitions
// ============================================================

import { Level } from '../context/AppContext'

export interface LevelDef {
  id: Level
  label: string           // display label (e.g. "P1")
  labelCn: string         // Chinese label
  isNew?: boolean         // new curriculum flag
  description: string     // short description
  descriptionCn: string
}

export const LEVELS: LevelDef[] = [
  {
    id: 'K1',
    label: 'K1',
    labelCn: '幼儿班一年级',
    description: 'Kindergarten 1',
    descriptionCn: '幼儿园第一年',
  },
  {
    id: 'K2',
    label: 'K2',
    labelCn: '幼儿班二年级',
    description: 'Kindergarten 2',
    descriptionCn: '幼儿园第二年',
  },
  {
    id: 'P1',
    label: 'P1',
    labelCn: '小学一年级',
    description: 'Primary 1',
    descriptionCn: '小学一年级',
  },
  {
    id: 'P2',
    label: 'P2',
    labelCn: '小学二年级',
    description: 'Primary 2',
    descriptionCn: '小学二年级',
  },
  {
    id: 'P3',
    label: 'P3',
    labelCn: '小学三年级',
    description: 'Primary 3',
    descriptionCn: '小学三年级',
  },
  {
    id: 'P4',
    label: 'P4',
    labelCn: '小学四年级',
    description: 'Primary 4',
    descriptionCn: '小学四年级',
  },
  {
    id: 'P5',
    label: 'P5',
    labelCn: '小学五年级',
    description: 'Primary 5',
    descriptionCn: '小学五年级',
  },
  {
    id: 'P6',
    label: 'P6',
    labelCn: '小学六年级',
    description: 'Primary 6',
    descriptionCn: '小学六年级',
  },
  {
    id: 'P1new',
    label: 'P1 新!',
    labelCn: '小学一年级（新）',
    isNew: true,
    description: 'Primary 1 (New Curriculum)',
    descriptionCn: '新课程·小学一年级',
  },
  {
    id: 'P2new',
    label: 'P2 新!',
    labelCn: '小学二年级（新）',
    isNew: true,
    description: 'Primary 2 (New Curriculum)',
    descriptionCn: '新课程·小学二年级',
  },
]

export const getLevelById = (id: Level): LevelDef | undefined =>
  LEVELS.find(l => l.id === id)
