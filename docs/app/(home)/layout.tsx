import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { BookIcon, NewspaperIcon } from 'lucide-react';

export default function Layout({ children }: LayoutProps<'/'>) {
  return <HomeLayout 
  {...baseOptions()}
  style={
    {
      '--spacing-fd-container': '1120px',
    } as object
  }
  links={
    [
      {
        icon: <BookIcon />,
        label: "Visit documentation",
        text: 'Documentation',
        url: '/docs',
      },
      {
        icon: <NewspaperIcon />,
        label: "Visit blog",
        text: 'Blog',
        url: '/blog',
      },
    ]
  }
  >{children}</HomeLayout>;
}
