import React from 'react';
import { Skeleton } from '@/components/common/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/card';
import { Separator } from '@/components/common/separator';

export const OrderDetailSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-2 h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Información del pedido */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Estado del pedido */}
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-24" />
              </div>
              
              <div className="flex space-x-2">
                <Skeleton className="h-10 w-[200px]" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            
            <Separator />
            
            {/* Asignación de repartidor */}
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-5 w-36" />
              
              <div className="flex space-x-2">
                <Skeleton className="h-10 w-[200px]" />
                <Skeleton className="h-10 w-36" />
              </div>
            </div>
            
            <Separator />
            
            {/* Línea de tiempo */}
            <div>
              <Skeleton className="mb-4 h-5 w-28" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalles del cliente y resumen */}
        <div className="space-y-6">
          {/* Información del cliente */}
          <Card>
            <CardHeader>
              <CardTitle><Skeleton className="h-6 w-36" /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              
              <Separator />
              
              <div className="space-y-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
              </div>
            </CardContent>
          </Card>
          
          {/* Resumen del pedido */}
          <Card>
            <CardHeader>
              <CardTitle><Skeleton className="h-6 w-36" /></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Items del pedido */}
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* Totales */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};