'use client'

import AuthGate from '@/components/AuthGate'

export default function RulesPage() {
  return (
    <AuthGate>
      <main className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-8">Rules</h1>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Picking Games</h2>
          <p className="text-base text-gray-700">
            Each week, you'll pick the winner of 10 college football games. Assign a point value from 1 to 10 based on your confidence level.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Double Down</h2>
          <p className="text-base text-gray-700">
            You can “double down” on one game each week. If you're right, you earn double the points. If you're wrong, you lose the same amount.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Locking Picks</h2>
          <p className="text-base text-gray-700">
            Picks for each game lock 15 minutes before its kickoff time. After that, you can't change your selection.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Scoring & Leaderboard</h2>
          <p className="text-base text-gray-700">
            Scores accumulate over the season. The player with the most points at the end wins. Tiebreakers may be added if needed.
          </p>
        </section>
      </main>
    </AuthGate>
  )
}
