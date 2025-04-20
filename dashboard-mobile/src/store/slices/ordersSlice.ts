import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

interface Order {
  id: string;
  restaurantId: string;
  customerId: string;
  deliveryDriverId: string;
  items: any[];
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    updateOrderInState: (state, action) => {
      const index = state.orders.findIndex((order) => order.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    addNewOrder: (state, action) => {
      state.orders.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex((order) => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      });
  },
});

export const { updateOrderInState, addNewOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
