'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Team = {
  id: string
  name: string
  short_name: string
  logo_url: string
  color: string
}

export default function TeamsSheet() {
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    const fetchTeams = async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, short_name, logo_url, color')
        .order('name', { ascending: true })

      if (!error && data) setTeams(data)
    }

    fetchTeams()
  }, [])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
      {teams.map((team) => (
        <div
          key={team.id}
          className="rounded-xl p-4 flex flex-col items-center text-center shadow"
          style={{
            background: `radial-gradient(circle at center, ${team.color} 0%, #000000 100%)`
          }}
        >
          <img
            src={team.logo_url}
            alt={`${team.name} logo`}
            className="w-16 h-16 object-contain mb-3"
          />
          <h2 className="text-white font-semibold text-lg">{team.name}</h2>
          <p className="text-white text-sm opacity-80">{team.short_name}</p>
        </div>
      ))}
    </div>
  )
}
