export interface FeatureItem {
  id: string;
  iconName: string;
  title: string;
  description: string;
  badge?: string;
}

export const featuresList: FeatureItem[] = [
  {
    id: 'offline-reading',
    iconName: 'WifiOff',
    title: 'Offline Reading',
    description: 'Download your entire library to read anywhere, anytime without requiring an internet connection.'
  },
  {
    id: 'reading-streak',
    iconName: 'Flame',
    title: 'Reading Streak',
    description: 'Track daily reading goals and maintain your momentum with habit-building streak trackers.'
  },
  {
    id: 'bookmarks',
    iconName: 'Bookmark',
    title: 'Smart Bookmarks',
    description: 'Save important pages with quick visual tabs and category tags for easy reference.'
  },
  {
    id: 'highlights',
    iconName: 'Highlighter',
    title: 'Multi-Color Highlights',
    description: 'Organize key quotes using customizable highlight colors and instant filter views.'
  },
  {
    id: 'translator',
    iconName: 'Languages',
    title: 'Instant AI Translator',
    description: 'Translate highlighted paragraphs into 30+ languages in real-time with high accuracy.'
  },
  {
    id: 'achievements',
    iconName: 'Trophy',
    title: 'Reading Achievements',
    description: 'Unlock milestones, earn reading badges, and celebrate completed books.'
  },
  {
    id: 'multi-device-sync',
    iconName: 'Smartphone',
    title: 'Multi-Device Sync',
    description: 'Seamlessly switch from laptop browser to phone app without losing your exact reading position.'
  },
  {
    id: 'reading-analytics',
    iconName: 'BarChart3',
    title: 'Reading Analytics',
    description: 'Visualize your reading speed, total minutes read, finished chapters, and monthly trends.'
  }
];
