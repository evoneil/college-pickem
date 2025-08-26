'use client'

import AuthGate from '@/components/AuthGate'

export default function RulesPage() {
  return (
    <AuthGate>
      <main className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-xl mb-6">Rules</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">1. Weekly Format</h2>
          <p className="text-base text-[#DEDEDE] mb-4">
            Each “week” runs Tuesday through Monday, aligning with the college football slate (e.g. Thursday openers, Saturday games, and rare Monday matchups).
          </p>
          <p className="text-base text-[#DEDEDE]">
            The pick sheet for each week will be released by Tuesday at 8PM ET and must be completed prior to each game’s individual lock time, which occurs 15 minutes before kickoff.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">2. Game Selection</h2>
          <p className="text-base text-[#DEDEDE] mb-2">
            Each week, the pool will feature 10 curated games, selected based on:
          </p>
          <ul className="list-disc text-[#DEDEDE] list-outside pl-5 text-base mb-4">
            <li>Spread competitiveness (ideally &lt; 10 points)</li>
            <li>Team relevance (Power 4 teams prioritized)</li>
            <li>National interest (rivalries, ranked matchups, primetime slots)</li>
            <li>Both teams must be in the FBS</li>
          </ul>
          <p className="text-base text-[#DEDEDE]">
            At least 8 of 10 games will involve Power 4 teams.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">3. Making Picks</h2>
          <p className="text-base text-[#DEDEDE] mb-2">
            For each of the 10 games:
          </p>
          <ul className="list-disc list-outside pl-5 text-[#DEDEDE] text-base mb-4">
            <li>Choose the team you believe will win outright (moneyline only — no spread involved)</li>
            <li>Each game will have an associated point value. The 10 point game is theoretically the most difficult to pick, while the 1 point game is the easiest</li>
            <li>If you guess the correct winner, you are awarded that number of points. If your pick is incorrect, you lose nor gain any points. Double downs are an exception to this rule and will be explained in the next section</li>
          </ul>
          <p className="text-base text-[#DEDEDE]">
            All picks and double downs are displayed in the weekly scoreboard. Players will not see other players’ picks until that game’s kickoff.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">4. Double Down</h2>
          <p className="text-base text-[#DEDEDE] mb-2">
            You are given the option to Double Down on one game each week.
          </p>
          <ul className="list-disc text-[#DEDEDE] list-outside pl-5 text-base mb-4">
            <li>A successful Double Down earns 2x the point value (e.g., 10 becomes 20)
            </li>
            <li>An incorrect Double Down results in –1x the point value (e.g., 10 becomes -10)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">5. Locking Picks
          </h2>
          <p className="text-base text-[#DEDEDE] mb-4">
            Picks lock individually 15 minutes before each game’s scheduled kickoff.
            You may edit any unlocked picks up until that game’s lock time.
            If no pick is made before lock time, it will be scored as zero points for that game.
          </p>
          <p className="text-base text-[#DEDEDE]">
            If you choose to double down on a game and it locks, you will no longer be able to change your double down.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">6. Scoring & Leaderboard
          </h2>
          <p className="text-base text-[#DEDEDE] mb-4">
            Points from each week’s picks are totaled and added to your season-long score.
            Standings are updated weekly and posted under the leaderboard tab.
            Missed weeks are not dropped — a missed pick scores zero.
          </p>
          <p className="text-base text-[#DEDEDE]">
            In addition to the overall winners, the individual(s) who wins each week will be awarded a small prize. If multiple players tie for the highest score of the week, the prize will be evenly distributed amongst those players. The weekly prize will be a predetermined portion of the total pool.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">7. Tiebreakers (End of Season)</h2>
          <p className="text-base mb-2 text-[#DEDEDE]">
            If two or more players are tied at the end of the season, ties will be broken in the following order:
          </p>
          <ul className="list-decimal text-[#DEDEDE] text-base pl-5 mb-4">
            <li>Total correct picks across all weeks
            </li>
            <li>Most Double Down wins</li>
            <li>Highest single-week score</li>
            <li>Total points in final week’s 10-point game (closest guess without going over)</li>
            <li>Coin flip (if all else fails)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Miscellaneous Rules & Edge Cases
          </h2>
          <h3 className="font-medium text-lg mb-2">Postponed/Canceled Games:</h3>
          <p className="text-base text-[#DEDEDE] mb-4">
            If a game is canceled or postponed beyond Monday night of that week, the pick is void and no points are awarded or deducted. If a player doubled down on a cancelled game, they will have the opportunity to switch it to a different remaining, unlocked game.
          </p>
          <h3 className="font-medium text-lg mb-2">Week Zero & Bowl Weeks:</h3>
          <p className="text-base text-[#DEDEDE] mb-4">
            Week one will include week zero, spanning August 23 - Sept 1. The pool will end at conference championship games, bowl games will not be included.
          </p>
          <h3 className="font-medium text-lg mb-2">Team Name Changes / Game Location Adjustments</h3>
          <p className="text-base text-[#DEDEDE]">
            If a team or location changes after picks are submitted, the pick will stand unless the matchup fundamentally changes (e.g., a forfeit).
          </p>
        </section>
        <p className="text-red-300 font-semibold">
          Please reach out to league admins individually with any questions
        </p>



      </main>
    </AuthGate>
  )
}
