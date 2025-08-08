'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function useCollectionId() {
  const { data: session } = useSession()
  const [collectionId, setCollectionId] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      fetchCollectionId()
    }
  }, [session])

  const fetchCollectionId = async () => {
    try {
      const response = await fetch('/api/my-collection')
      if (response.ok) {
        const data = await response.json()
        setCollectionId(data.collectionAlias || data.collectionId)
      }
    } catch (error) {
      console.error('Error fetching collection ID:', error)
    }
  }

  return collectionId
}
