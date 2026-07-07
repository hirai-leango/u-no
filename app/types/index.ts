export interface UserProfile {
  uid: string
  displayName: string
  photoURL: string
  slug: string
  bio: string
  resume: Resume
  isSearchable: boolean
  createdAt: Date
}

export interface Resume {
  summary: string
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
}

export interface Education {
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
}

export interface Review {
  id: string
  toUserId: string
  fromUserId: string
  fromDisplayName: string
  fromPhotoURL: string
  fromSlug: string
  comment: string
  createdAt: Date
  updatedAt: Date
}

// レビューへの公正さ評価（実名）
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

// レビューへのツリーコメント（実名）
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
