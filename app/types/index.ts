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
