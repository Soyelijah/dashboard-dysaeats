'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Calendar, Download, Search, RefreshCw } from 'lucide-react';
import { Button } from '../common/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../common/card';
import { Input } from '../common/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../common/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/select';
import { Badge } from '../common/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '../common/pagination';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../common/dialog';
import { useToast } from '@/hooks/useToast';
import { useDictionary } from '@/hooks/useDictionary';
import { getPaymentTransactions, refundPayment, getPaymentTransaction, PaymentTransaction } from '@/services/paymentService';
import { formatDate } from '@/lib/utils';

interface TransactionsListProps {
  restaurantId?: string;
}

const TransactionsList: React.FC<TransactionsListProps> = ({ restaurantId }) => {
  const { toast } = useToast();
  const dict = useDictionary();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, selectedStatus]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (selectedStatus) {
        params.status = selectedStatus;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (dateRange.startDate) {
        params.startDate = dateRange.startDate;
      }

      if (dateRange.endDate) {
        params.endDate = dateRange.endDate;
      }

      if (restaurantId) {
        params.restaurantId = restaurantId;
      }

      const { data, total } = await getPaymentTransactions(params);
      setTransactions(data);
      setPagination(prev => ({
        ...prev,
        total,
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: dict.payments.error,
        description: dict.payments.errorFetchingTransactions,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
    fetchTransactions();
  };

  const handleReset = () => {
    setSelectedStatus('');
    setSearchQuery('');
    setDateRange({
      startDate: '',
      endDate: '',
    });
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
    fetchTransactions();
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(pagination.total / pagination.limit)) {
      return;
    }
    setPagination(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const openRefundDialog = async (transaction: PaymentTransaction) => {
    if (transaction.status !== 'completed') {
      toast({
        title: dict.payments.error,
        description: dict.payments.cannotRefundIncomplete,
        variant: 'destructive',
      });
      return;
    }

    try {
      const detailedTransaction = await getPaymentTransaction(transaction.id);
      setSelectedTransaction(detailedTransaction);
      setRefundAmount(detailedTransaction.amount.toString());
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      toast({
        title: dict.payments.error,
        description: dict.payments.errorFetchingDetails,
        variant: 'destructive',
      });
    }
  };

  const handleRefund = async () => {
    if (!selectedTransaction) return;

    try {
      setIsRefunding(true);
      const amount = parseFloat(refundAmount);
      
      if (isNaN(amount) || amount <= 0 || amount > selectedTransaction.amount) {
        toast({
          title: dict.payments.error,
          description: dict.payments.invalidRefundAmount,
          variant: 'destructive',
        });
        setIsRefunding(false);
        return;
      }

      await refundPayment(selectedTransaction.id, amount);
      toast({
        title: dict.payments.success,
        description: dict.payments.refundSuccess,
      });
      setIsDialogOpen(false);
      fetchTransactions();
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: dict.payments.error,
        description: dict.payments.refundError,
        variant: 'destructive',
      });
    } finally {
      setIsRefunding(false);
    }
  };

  const exportTransactions = () => {
    // Placeholder for export functionality
    const csv = [
      [
        'Transaction ID',
        'Order ID',
        'Amount',
        'Currency',
        'Status',
        'Payment Method',
        'Transaction Fee',
        'Platform Fee',
        'Net Amount',
        'Reference',
        'Date',
      ].join(','),
      ...transactions.map(t => [
        t.id,
        t.orderId,
        t.amount,
        t.currency,
        t.status,
        t.paymentMethod,
        t.transactionFee,
        t.platformFee,
        t.netAmount,
        t.reference,
        new Date(t.createdAt).toLocaleString(),
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'destructive';
      case 'refunded':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.payments.transactions}</CardTitle>
        <CardDescription>{dict.payments.transactionsDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-4 md:items-end mb-6">
          <div className="flex-1 space-y-2">
            <label htmlFor="search" className="text-sm font-medium">{dict.common.search}</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="search"
                placeholder={dict.payments.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/4 space-y-2">
            <label htmlFor="status" className="text-sm font-medium">{dict.common.status}</label>
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger id="status">
                <SelectValue placeholder={dict.payments.allStatuses} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{dict.payments.allStatuses}</SelectItem>
                <SelectItem value="completed">{dict.payments.statusCompleted}</SelectItem>
                <SelectItem value="pending">{dict.payments.statusPending}</SelectItem>
                <SelectItem value="failed">{dict.payments.statusFailed}</SelectItem>
                <SelectItem value="refunded">{dict.payments.statusRefunded}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-1/4 space-y-2">
            <label htmlFor="startDate" className="text-sm font-medium">{dict.payments.startDate}</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/4 space-y-2">
            <label htmlFor="endDate" className="text-sm font-medium">{dict.payments.endDate}</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {dict.common.reset}
            </Button>
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              {dict.common.search}
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.payments.transactionId}</TableHead>
                <TableHead>{dict.payments.orderId}</TableHead>
                <TableHead>
                  <div className="flex items-center">
                    {dict.payments.amount}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>{dict.common.status}</TableHead>
                <TableHead>{dict.payments.paymentMethod}</TableHead>
                <TableHead>{dict.payments.netAmount}</TableHead>
                <TableHead>{dict.common.date}</TableHead>
                <TableHead className="text-right">{dict.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    {dict.payments.noTransactions}
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.id.substring(0, 8)}</TableCell>
                    <TableCell>{transaction.orderId.substring(0, 8)}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: transaction.currency.toUpperCase(),
                      }).format(transaction.amount / 100)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(transaction.status)}>
                        {dict.payments[`status${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}`]}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.paymentMethod}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: transaction.currency.toUpperCase(),
                      }).format(transaction.netAmount / 100)}
                    </TableCell>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRefundDialog(transaction)}
                        disabled={transaction.status !== 'completed'}
                      >
                        {dict.payments.refund}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            {dict.payments.showing} {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} {dict.payments.of} {pagination.total} {dict.payments.transactions.toLowerCase()}
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(pagination.page - 1)} 
                  disabled={pagination.page === 1}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.limit)) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <PaginationItem key={pageNumber}>
                    <Button
                      variant={pageNumber === pagination.page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(pagination.page + 1)} 
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={exportTransactions}>
          <Download className="mr-2 h-4 w-4" />
          {dict.payments.exportTransactions}
        </Button>
      </CardFooter>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dict.payments.processRefund}</DialogTitle>
            <DialogDescription>
              {dict.payments.refundDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedTransaction && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{dict.payments.transactionDetails}</label>
                  <div className="rounded-md bg-gray-50 p-3 text-sm">
                    <div><strong>{dict.payments.orderId}:</strong> {selectedTransaction.orderId}</div>
                    <div><strong>{dict.payments.amount}:</strong> {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: selectedTransaction.currency.toUpperCase(),
                    }).format(selectedTransaction.amount / 100)}</div>
                    <div><strong>{dict.payments.date}:</strong> {formatDate(selectedTransaction.createdAt)}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="refundAmount" className="text-sm font-medium">{dict.payments.refundAmount}</label>
                  <Input
                    id="refundAmount"
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    min={1}
                    max={selectedTransaction.amount}
                    required
                  />
                  <div className="text-xs text-gray-500">
                    {dict.payments.maxRefund}: {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: selectedTransaction.currency.toUpperCase(),
                    }).format(selectedTransaction.amount / 100)}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {dict.common.cancel}
            </Button>
            <Button onClick={handleRefund} disabled={isRefunding} loading={isRefunding}>
              {dict.payments.processRefund}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TransactionsList;