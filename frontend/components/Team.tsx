import React from 'react';
import { Section } from './ui/Section';
import { TeamMember } from '../types';

const team: TeamMember[] = [
  {
    name: 'Cem Dagdelen',
    role: 'Founder',
    bio: 'Systems designer. Building at the human-AI interface.'
  },
  {
    name: 'Oguzhan (Ozzi) Yayla',
    role: 'Co-founder',
    bio: 'AI Systems Architect. Agent of agents.'
  },
  {
    name: 'Polina Sarekina',
    role: 'Operations',
    bio: "Operations and connections. The lab's connective tissue."
  }
];

export const Team: React.FC = () => {
  return (
    <Section id="team" className="bg-background">
      <div className="max-w-[1600px] mx-auto border-x border-border">
        <div className="p-8 lg:p-12 border-b border-border">
          <h2 className="font-nav text-xs text-zinc-500 uppercase tracking-widest">[04] Team</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {team.map((member) => (
            <div key={member.name} className="p-8 lg:p-12 hover:bg-zinc-900/40 transition-colors group">
              <div className="w-12 h-12 bg-zinc-800 mb-6 flex items-center justify-center font-nav text-lg font-bold text-zinc-500 group-hover:bg-white group-hover:text-black transition-colors">
                {member.name.charAt(0)}
              </div>
              <h3 className="text-lg font-header font-bold mb-1">{member.name}</h3>
              <div className="font-nav text-xs text-zinc-500 mb-4 uppercase">{member.role}</div>
              <p className="text-zinc-400 text-sm leading-relaxed font-body-text">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

