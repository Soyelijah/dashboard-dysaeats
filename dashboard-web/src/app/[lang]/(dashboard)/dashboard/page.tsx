import { getDictionary } from '@/lib/dictionary';
import Link from 'next/link';

export default async function DashboardPage({
  params
}: {
  params: { lang: string }
}) {
  const dict = await getDictionary(params.lang);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          {dict.navigation.dashboard}
        </h1>
        <div className="mt-4 flex space-x-4">
          <Link href={`/${params.lang === 'es' ? 'en' : 'es'}/dashboard`} className="text-primary hover:underline">
            {params.lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          </Link>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface rounded-lg shadow p-6">
          <h3 className="text-primary font-bold">{dict.analytics.totalOrders}</h3>
          <p className="text-3xl font-bold">24</p>
        </div>
        
        <div className="bg-surface rounded-lg shadow p-6">
          <h3 className="text-primary font-bold">{dict.analytics.totalSales}</h3>
          <p className="text-3xl font-bold">$1,248</p>
        </div>
        
        <div className="bg-surface rounded-lg shadow p-6">
          <h3 className="text-primary font-bold">{dict.analytics.averageOrder}</h3>
          <p className="text-3xl font-bold">$52</p>
        </div>
        
        <div className="bg-surface rounded-lg shadow p-6">
          <h3 className="text-primary font-bold">{dict.orders.newOrder}</h3>
          <p className="text-3xl font-bold">3</p>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-text-primary">
            {dict.orders.title}
          </h2>
          <div className="divide-y">
            {[1, 2, 3].map((order) => (
              <div key={order} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">#{1000 + order}</p>
                  <p className="text-text-secondary text-sm">
                    {dict.orders.status.pending}
                  </p>
                </div>
                <p className="text-primary">$49.99</p>
              </div>
            ))}
          </div>
          <Link
            href={`/${params.lang}/orders`}
            className="mt-4 block text-center text-primary hover:underline"
          >
            {dict.common.seeAll}
          </Link>
        </div>
        
        <div className="bg-surface rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-text-primary">
            {dict.analytics.topProducts}
          </h2>
          <div className="divide-y">
            {[
              { name: 'Pizza Margarita', price: '$12.99', qty: 15 },
              { name: 'Hamburguesa Clásica', price: '$9.99', qty: 12 },
              { name: 'Tacos al Pastor', price: '$7.99', qty: 10 },
            ].map((product, index) => (
              <div key={index} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-text-secondary text-sm">
                    {dict.menu.price}: {product.price}
                  </p>
                </div>
                <p className="text-primary">{product.qty}</p>
              </div>
            ))}
          </div>
          <Link
            href={`/${params.lang}/menu`}
            className="mt-4 block text-center text-primary hover:underline"
          >
            {dict.common.seeAll}
          </Link>
        </div>
      </div>
    </div>
  );
}