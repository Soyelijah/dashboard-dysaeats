import { redirect } from 'next/navigation';

export default function Home() {
  // Redirección en tiempo de renderizado al dashboard
  redirect('/dashboard');
  
  // Este código nunca se ejecutará debido a la redirección, pero es necesario
  // para satisfacer el tipo de retorno de React
  return null;
}