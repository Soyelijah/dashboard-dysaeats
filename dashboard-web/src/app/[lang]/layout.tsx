import { ReactNode } from 'react';

interface LangLayoutProps {
  children: ReactNode;
  params: {
    lang: string;
  };
}

export default function LangLayout({ children, params }: LangLayoutProps) {
  return (
    <div lang={params.lang}>
      {children}
    </div>
  );
}