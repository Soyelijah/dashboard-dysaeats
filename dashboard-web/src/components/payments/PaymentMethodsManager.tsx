'use client';

import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, Trash2, Check, Building, Wallet } from 'lucide-react';
import { Button } from '../common/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../common/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../common/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/select';
import { Input } from '../common/input';
import { Label } from '../common/label';
import { Separator } from '../common/separator';
import { Badge } from '../common/badge';
import { useToast } from '@/hooks/useToast';
import { useDictionary } from '@/hooks/useDictionary';
import { 
  getPaymentMethods, 
  createPaymentMethod, 
  updatePaymentMethod, 
  deletePaymentMethod,
  PaymentMethod,
  CreatePaymentMethodDto
} from '@/services/paymentService';

const PaymentMethodsManager: React.FC = () => {
  const { toast } = useToast();
  const dict = useDictionary();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<CreatePaymentMethodDto>({
    type: 'credit_card',
    isDefault: false,
    details: {
      lastFour: '',
      brand: '',
      expiryMonth: '',
      expiryYear: '',
    }
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const data = await getPaymentMethods();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast({
        title: dict.payments.error,
        description: dict.payments.errorFetchingMethods,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTypeChange = (value: string) => {
    let details = {};
    
    // Reset details based on the selected type
    switch (value) {
      case 'credit_card':
      case 'debit_card':
        details = {
          lastFour: '',
          brand: '',
          expiryMonth: '',
          expiryYear: '',
        };
        break;
      case 'bank_transfer':
        details = {
          accountNumber: '',
          bankName: '',
        };
        break;
      case 'digital_wallet':
        details = {
          walletName: '',
        };
        break;
    }
    
    setFormData(prev => ({
      ...prev,
      type: value as any,
      details
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleAddPaymentMethod = async () => {
    try {
      await createPaymentMethod(formData);
      toast({
        title: dict.payments.success,
        description: dict.payments.methodAdded,
      });
      setOpenDialog(false);
      fetchPaymentMethods();
      // Reset form
      setFormData({
        type: 'credit_card',
        isDefault: false,
        details: {
          lastFour: '',
          brand: '',
          expiryMonth: '',
          expiryYear: '',
        }
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: dict.payments.error,
        description: dict.payments.errorAddingMethod,
        variant: 'destructive',
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await updatePaymentMethod(id, { isDefault: true });
      toast({
        title: dict.payments.success,
        description: dict.payments.defaultMethodSet,
      });
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast({
        title: dict.payments.error,
        description: dict.payments.errorSettingDefault,
        variant: 'destructive',
      });
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (window.confirm(dict.payments.confirmDelete)) {
      try {
        await deletePaymentMethod(id);
        toast({
          title: dict.payments.success,
          description: dict.payments.methodDeleted,
        });
        fetchPaymentMethods();
      } catch (error) {
        console.error('Error deleting payment method:', error);
        toast({
          title: dict.payments.error,
          description: dict.payments.errorDeletingMethod,
          variant: 'destructive',
        });
      }
    }
  };

  const renderMethodIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-5 w-5" />;
      case 'bank_transfer':
        return <Building className="h-5 w-5" />;
      case 'digital_wallet':
        return <Wallet className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getMethodName = (method: PaymentMethod) => {
    const { type, details } = method;
    
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return `${details.brand} •••• ${details.lastFour}`;
      case 'bank_transfer':
        return `${details.bankName} •••• ${details.accountNumber?.slice(-4)}`;
      case 'digital_wallet':
        return details.walletName;
      default:
        return type;
    }
  };

  const getMethodDescription = (method: PaymentMethod) => {
    const { type, details } = method;
    
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return `${dict.payments.expires} ${details.expiryMonth}/${details.expiryYear}`;
      case 'bank_transfer':
        return dict.payments.bankTransfer;
      case 'digital_wallet':
        return dict.payments.digitalWallet;
      default:
        return '';
    }
  };

  const renderPaymentMethods = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (paymentMethods.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CreditCard className="h-12 w-12 mb-4 text-gray-400" />
          <h3 className="text-lg font-medium">{dict.payments.noMethodsTitle}</h3>
          <p className="text-sm text-gray-500 mt-2">{dict.payments.noMethodsDesc}</p>
        </div>
      );
    }

    return paymentMethods.map((method) => (
      <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg mb-3">
        <div className="flex items-center">
          <div className="bg-gray-100 p-2 rounded-full mr-4">
            {renderMethodIcon(method.type)}
          </div>
          <div>
            <div className="flex items-center">
              <h3 className="font-medium">{getMethodName(method)}</h3>
              {method.isDefault && (
                <Badge variant="secondary" className="ml-2">
                  {dict.payments.default}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">{getMethodDescription(method)}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {!method.isDefault && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleSetDefault(method.id)}
              title={dict.payments.setAsDefault}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDeletePaymentMethod(method.id)}
            title={dict.payments.delete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    ));
  };

  const renderFormFields = () => {
    switch (formData.type) {
      case 'credit_card':
      case 'debit_card':
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="details.brand">{dict.payments.cardBrand}</Label>
              <Input 
                id="details.brand" 
                name="details.brand" 
                value={formData.details?.brand || ''} 
                onChange={handleInputChange} 
                placeholder="Visa, Mastercard, etc."
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="details.lastFour">{dict.payments.lastFourDigits}</Label>
              <Input 
                id="details.lastFour" 
                name="details.lastFour" 
                value={formData.details?.lastFour || ''} 
                onChange={handleInputChange} 
                placeholder="1234"
                maxLength={4}
                pattern="[0-9]{4}"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="details.expiryMonth">{dict.payments.expiryMonth}</Label>
                <Input 
                  id="details.expiryMonth" 
                  name="details.expiryMonth" 
                  value={formData.details?.expiryMonth || ''} 
                  onChange={handleInputChange} 
                  placeholder="MM"
                  maxLength={2}
                  pattern="[0-9]{2}"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="details.expiryYear">{dict.payments.expiryYear}</Label>
                <Input 
                  id="details.expiryYear" 
                  name="details.expiryYear" 
                  value={formData.details?.expiryYear || ''} 
                  onChange={handleInputChange} 
                  placeholder="YYYY"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  required
                />
              </div>
            </div>
          </>
        );
      case 'bank_transfer':
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="details.bankName">{dict.payments.bankName}</Label>
              <Input 
                id="details.bankName" 
                name="details.bankName" 
                value={formData.details?.bankName || ''} 
                onChange={handleInputChange} 
                placeholder={dict.payments.enterBankName}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="details.accountNumber">{dict.payments.accountNumber}</Label>
              <Input 
                id="details.accountNumber" 
                name="details.accountNumber" 
                value={formData.details?.accountNumber || ''} 
                onChange={handleInputChange} 
                placeholder={dict.payments.enterAccountNumber}
                required
              />
            </div>
          </>
        );
      case 'digital_wallet':
        return (
          <div className="grid gap-2">
            <Label htmlFor="details.walletName">{dict.payments.walletName}</Label>
            <Input 
              id="details.walletName" 
              name="details.walletName" 
              value={formData.details?.walletName || ''} 
              onChange={handleInputChange} 
              placeholder="PayPal, Google Pay, etc."
              required
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.payments.paymentMethods}</CardTitle>
        <CardDescription>{dict.payments.managePaymentMethods}</CardDescription>
      </CardHeader>
      <CardContent>
        {renderPaymentMethods()}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {dict.payments.addMethod}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dict.payments.addPaymentMethod}</DialogTitle>
              <DialogDescription>
                {dict.payments.addMethodDescription}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="type">{dict.payments.methodType}</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dict.payments.selectMethodType} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">{dict.payments.creditCard}</SelectItem>
                    <SelectItem value="debit_card">{dict.payments.debitCard}</SelectItem>
                    <SelectItem value="bank_transfer">{dict.payments.bankTransfer}</SelectItem>
                    <SelectItem value="digital_wallet">{dict.payments.digitalWallet}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              {renderFormFields()}
              
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isDefault" className="text-sm font-normal">
                  {dict.payments.setAsDefault}
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                {dict.common.cancel}
              </Button>
              <Button onClick={handleAddPaymentMethod}>
                {dict.payments.addMethod}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default PaymentMethodsManager;