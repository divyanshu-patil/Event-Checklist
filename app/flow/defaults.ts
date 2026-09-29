export type Item = { id: string; text: string; time: string };
export type Group = { id: string; title: string; items: Item[] };
export type Sec = { id: string; title: string; blurb: string; groups: Group[] };
export type Flow = { name: string; by: string; to: string; intro: string; asks: string; secs: Sec[] };

let n = 0;
const it = (time: string, text: string): Item => ({ id: `d${n++}`, time, text });
const g = (title: string, items: Item[]): Group => ({ id: `g${n++}`, title, items });

export const defaultFlow: Flow = {
  name: '24-Hour National Hackathon',
  by: 'Organising committee',
  to: 'The Principal / Head of Institution',
  intro:
    'We, the organising committee, respectfully seek your approval to host a 24-hour, offline, national-level inter-college hackathon on campus at the end of October (tentative), with 75–100 teams of 4 members each. Registration will run on Unstop, with a PPT screening round before the on-campus hackathon. Food and stay will be provided by the organisers. Below is our week-wise preparation plan, the detailed two-day schedule, and our post-event plan, followed by the permissions we request.',
  asks: [
    'Approval to host the hackathon on campus',
    'Venue booking for the main hall, breakout rooms and registration desk',
    'Overnight stay permission for participants and volunteers',
    'Electricity load approval and 24-hour power backup',
    'Fire & safety clearance, and campus security support',
    'Permission to sign sponsor agreements and use the institution name and logo',
    'Permission for photo / video coverage and social media promotion',
  ].join('\n'),
  secs: [
    {
      id: 's1',
      title: '4-Week Plan',
      blurb: 'Preparation timeline leading up to the event.',
      groups: [
        g('Week 1 · Approvals & Foundations', [
          it('Day 1–2', 'College management approval'),
          it('Day 2–3', 'Venue booking confirmation'),
          it('Day 3–5', 'Sponsorship deck & brochure'),
          it('Day 5–7', 'Budget plan & core team formation'),
        ]),
        g('Week 2 · Registration & Outreach', [
          it('Day 8', 'Open registrations on Unstop'),
          it('Day 8–14', 'Marketing & social media campaign'),
          it('Day 9–12', 'Finalise problem statements'),
          it('Day 10–14', 'Invite judges & mentors'),
        ]),
        g('Week 3 · Screening & Logistics', [
          it('Day 15–17', 'Round 1 · PPT screening'),
          it('Day 18', 'Announce shortlisted teams'),
          it('Day 18–21', 'Food vendor & stay arrangements'),
          it('Day 19–21', 'Kits, printing & merchandise'),
        ]),
        g('Week 4 · Final Preparation', [
          it('Day 22–24', 'Tech & power check'),
          it('Day 24–26', 'Volunteer briefing & role allocation'),
          it('Day 26–27', 'Safety & security walkthrough'),
          it('Day 28', 'Full dry run'),
        ]),
      ],
    },
    {
      id: 's2',
      title: 'Hackathon Plan · Day 1 & Day 2',
      blurb: 'Detailed schedule for the 24-hour event (times tentative).',
      groups: [
        g('Day 1 · Check-in', [
          it('07:00–10:00', 'Check-in & registration desk'),
          it('07:00–10:00', 'ID verification & kit distribution'),
          it('07:00–10:00', 'Stay / room allotment'),
          it('08:00–09:30', 'Breakfast'),
        ]),
        g('Day 1 · Felicitation', [
          it('10:30', 'Guests arrive & seating'),
          it('10:40', 'Lamp lighting & welcome address'),
          it('10:50', 'Felicitation of chief guest, judges & sponsors'),
        ]),
        g('Day 1 · Intro Sequence', [
          it('11:15', 'Event introduction & rules briefing'),
          it('11:30', 'Problem statements reveal'),
          it('11:40', 'Judging criteria & round schedule'),
          it('11:50', 'Mentor introductions'),
        ]),
        g('Day 1 · Hacking Begins', [
          it('12:00', 'Hacking begins'),
          it('13:30–14:30', 'Lunch'),
          it('15:00–17:00', 'Mentor rounds & sponsor workshop'),
          it('17:30', 'Refreshments'),
        ]),
        g('Day 1 · Evening Rounds', [
          it('18:00', 'Round 1 · Judging'),
          it('19:30–20:30', 'Dinner'),
          it('21:00', 'Round 2 · Judging'),
        ]),
        g('Night · Overnight', [
          it('23:00–01:00', 'Fun activities & engagement'),
          it('01:00', 'Midnight snacks & energy drinks'),
          it('02:00–06:00', 'Quiet hours · security patrol'),
        ]),
        g('Day 2 · Final Push', [
          it('07:00–08:30', 'Breakfast'),
          it('09:30', 'Code freeze · final submissions'),
          it('10:00', 'Round 3 · Final judging & demos'),
          it('12:00', 'Hacking ends'),
        ]),
        g('Day 2 · Closing', [
          it('12:00–13:00', 'Lunch'),
          it('13:00', 'Results, prizes & certificates'),
          it('14:30', 'Closing ceremony & group photo'),
          it('15:30', 'Departure'),
        ]),
        g('Venue Map · Zones', [
          it('Zone A', 'Registration & check-in desk (entrance)'),
          it('Zone B', 'Main hall · ceremony & hacking floor'),
          it('Zone C', 'Mentor & sponsor stalls'),
          it('Zone D', 'Judging rooms'),
          it('Zone E', 'Food court & rest / stay area'),
        ]),
      ],
    },
    {
      id: 's3',
      title: 'Post-Hackathon Plan',
      blurb: 'Wrap-up and follow-up after the event.',
      groups: [
        g('Immediately After', [
          it('Day +1', 'Venue clean-up & handover'),
          it('Day +1–2', 'Vendor payments & reconciliation'),
          it('Day +2', 'Thank-you notes to sponsors, judges & volunteers'),
        ]),
        g('Within 2 Weeks', [
          it('Week +1', 'Publish photos, video & highlights'),
          it('Week +1', 'Collect participant & sponsor feedback'),
          it('Week +2', 'Share winners showcase & sponsor hiring leads'),
        ]),
        g('Within 1 Month', [
          it('Week +3', 'Final report & budget summary to management'),
          it('Week +4', 'Retrospective & notes for next edition'),
        ]),
      ],
    },
  ],
};
