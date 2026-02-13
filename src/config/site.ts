// Site configuration
export const SITE = {
  title: 'SolusiGudang',
  description: 'Solusi pergudangan modern untuk meningkatkan efisiensi dan produktivitas bisnis Anda. ',
  url: 'https://staging.solusigudang.id',
  author: 'SolusiGudang - a part of Makitech Sistem Indonesia',
} as const;

export const NAVIGATION = [
  { name: 'Home', href: '/' },
  { name: 'Solution', href: '/solutions' },
  { name: 'Products', href: '/products' },
  { name: 'About', href: '/about' },
] as const;

export const SOCIAL_LINKS = {
  linkedin: 'https://linkedin.com/company/makitech-id',
  instagram: 'https://www.instagram.com/makitechsistem.id',
  youtube: 'https://www.youtube.com/@makitechsistemindonesia',
} as const;

