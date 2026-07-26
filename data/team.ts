export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  socials: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Prince Gajera",
    role: "Full Stack Developer & Co-Founder",
    bio: "Passionate engineer and product architect building next-generation digital reading, cloud architecture, and AI knowledge tools.",
    avatar: "/team/prince-gajera.jpg",
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      github: "https://github.com"
    }
  },
  {
    id: "2",
    name: "Bhanderi Prince",
    role: "Co-Founder — Social Media & Business Operations",
    bio: "Visionary co-founder driving growth, brand strategy, community engagement, and digital operations for EbookVala.",
    avatar: "/team/bhanderi-prince.jpg",
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      github: "https://github.com"
    }
  }
];
