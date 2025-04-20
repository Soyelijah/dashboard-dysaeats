import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  rating: number;
  cuisineType: string;
  logo: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RestaurantsState {
  restaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  loading: boolean;
  error: string | null;
}

const initialState: RestaurantsState = {
  restaurants: [],
  currentRestaurant: null,
  loading: false,
  error: null,
};

export const fetchRestaurants = createAsyncThunk(
  'restaurants/fetchRestaurants',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/restaurants');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch restaurants'
      );
    }
  }
);

export const fetchRestaurantById = createAsyncThunk(
  'restaurants/fetchRestaurantById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/restaurants/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch restaurant details'
      );
    }
  }
);

const restaurantsSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRestaurantById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRestaurant = action.payload;
      })
      .addCase(fetchRestaurantById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default restaurantsSlice.reducer;
