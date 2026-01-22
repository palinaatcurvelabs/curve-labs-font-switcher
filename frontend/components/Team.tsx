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
  },
  {
    name: 'Maya Chen',
    role: 'Research Lead',
    bio: 'Deep learning researcher. Exploring emergent behaviors in multi-agent systems.'
  },
  {
    name: 'Alex Rivera',
    role: 'Product Designer',
    bio: 'Interface architect. Crafting intuitive experiences for complex systems.'
  },
  {
    name: 'Jordan Kim',
    role: 'Engineering',
    bio: 'Full-stack developer. Building scalable infrastructure for distributed networks.'
  }
];

export const Team: React.FC = () => {
  return (
    <Section id="team" className="bg-background">
      <div className="max-w-[1600px] mx-auto border-x border-border">
        <div className="p-8 lg:p-12 border-b border-border">
          <h2 className="font-mono text-xs text-zinc-500 uppercase tracking-widest">[04] Team</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* First Row */}
          {team.slice(0, 3).map((member, idx) => (
            <div
              key={member.name}
              className={`p-8 lg:p-12 hover:bg-zinc-900/40 transition-colors group border-b md:border-b-0 ${
                idx < 2 ? 'md:border-r' : ''
              } border-border`}
            >
              <div className="w-12 h-12 bg-zinc-800 mb-6 flex items-center justify-center font-mono text-lg font-bold text-zinc-500 group-hover:bg-white group-hover:text-black transition-colors">
                {member.name.charAt(0)}
              </div>
              <h3 className="text-lg font-header font-bold mb-1">{member.name}</h3>
              <div className="font-mono text-xs text-zinc-500 mb-4 uppercase">{member.role}</div>
              <p className="text-zinc-400 text-sm leading-relaxed font-body-text">
                {member.bio}
              </p>
            </div>
          ))}

          {/* Horizontal divider line between rows - only on desktop */}
          <div className="hidden md:block md:col-span-3 border-t border-border"></div>

          {/* Second Row */}
          {team.slice(3, 6).map((member, idx) => (
            <div
              key={member.name}
              className={`p-8 lg:p-12 hover:bg-zinc-900/40 transition-colors group ${
                idx < 2 ? 'md:border-r border-b md:border-b-0' : 'border-b md:border-b-0'
              } border-border`}
            >
              <div className="w-12 h-12 bg-zinc-800 mb-6 flex items-center justify-center font-mono text-lg font-bold text-zinc-500 group-hover:bg-white group-hover:text-black transition-colors">
                {member.name.charAt(0)}
              </div>
              <h3 className="text-lg font-header font-bold mb-1">{member.name}</h3>
              <div className="font-mono text-xs text-zinc-500 mb-4 uppercase">{member.role}</div>
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

