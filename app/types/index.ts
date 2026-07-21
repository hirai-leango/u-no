export interface ProfileLink {
  label: string
  url: string
}

export interface UserProfile {
  uid: string
  displayName: string
  photoURL: string
  slug: string
  headline: string
  bio: string
  links: ProfileLink[]
  resume: Resume
  isSearchable: boolean
  sns?: SnsLinks
  createdAt: Date
}

export interface SnsLinks {
  x?: string
  instagram?: string
  linkedin?: string
  facebook?: string
  youtube?: string
  note?: string
  github?: string
}

export interface Resume {
  skills: string[]
  experience: Experience[]
  education: Education[]
  resumeFileUrl?: string
}

export interface Experience {
  company: string
  title: string
  startDate: string
  endDate: string
  description: string
  url?: string
}

export interface Education {
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
}

export type Relationship =
  | 'boss' | 'subordinate' | 'colleague' | 'client' | 'contractor' | 'acquaintance' | 'other'

export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  boss: '上司',
  subordinate: '部下',
  colleague: '同僚',
  client: '取引先',
  contractor: '業務委託',
  acquaintance: '知人',
  other: 'その他',
}

export interface Review {
  id: string
  toUserId: string
  fromUserId: string
  fromDisplayName: string
  fromPhotoURL: string
  fromSlug: string
  fromHeadline?: string
  toDisplayName?: string
  toPhotoURL?: string
  toSlug?: string
  toHeadline?: string
  relationship: Relationship
  comment: string
  createdAt: Date
  updatedAt: Date
}

// エピソードへの公正さ評価（実名）
export interface Vote {
  id: string
  reviewId: string
  voterUid: string
  voterName: string
  voterPhoto: string
  voterSlug: string
  value: 'fair' | 'unfair'
  createdAt: Date
}

// エピソードへのツリーコメント（実名）
export interface ReviewComment {
  id: string
  reviewId: string
  parentId: string | null
  authorUid: string
  authorName: string
  authorPhoto: string
  authorSlug: string
  text: string
  createdAt: Date
}

// 通報
export interface Report {
  id: string
  targetType: 'review' | 'comment'
  targetId: string
  reporterUid: string
  reason: string
  createdAt: Date
  resolved: boolean
}
