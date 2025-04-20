import { supabase } from './client';

// Storage bucket names
const BUCKET_RESTAURANTS = 'restaurants';
const BUCKET_MENU_ITEMS = 'menu-items';
const BUCKET_PROFILE_IMAGES = 'profiles';

export const storageService = {
  // Initialize storage buckets (server-side only)
  initializeBuckets: async (): Promise<void> => {
    try {
      // Create restaurants bucket if it doesn't exist
      const { data: buckets } = await supabase.storage.listBuckets();
      
      const existingBuckets = new Set(buckets?.map(b => b.name) || []);
      
      if (!existingBuckets.has(BUCKET_RESTAURANTS)) {
        await supabase.storage.createBucket(BUCKET_RESTAURANTS, {
          public: true
        });
      }
      
      if (!existingBuckets.has(BUCKET_MENU_ITEMS)) {
        await supabase.storage.createBucket(BUCKET_MENU_ITEMS, {
          public: true
        });
      }
      
      if (!existingBuckets.has(BUCKET_PROFILE_IMAGES)) {
        await supabase.storage.createBucket(BUCKET_PROFILE_IMAGES, {
          public: true
        });
      }
    } catch (error) {
      console.error('Error initializing storage buckets:', error);
      throw error;
    }
  },
  
  // Upload restaurant image
  uploadRestaurantImage: async (
    restaurantId: string,
    file: File
  ): Promise<string> => {
    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurantId}-${Date.now()}.${fileExt}`;
      const filePath = `${restaurantId}/${fileName}`;
      
      // Upload file
      const { error } = await supabase.storage
        .from(BUCKET_RESTAURANTS)
        .upload(filePath, file, {
          upsert: true
        });
      
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data } = supabase.storage
        .from(BUCKET_RESTAURANTS)
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading restaurant image:', error);
      throw error;
    }
  },
  
  // Upload menu item image
  uploadMenuItemImage: async (
    restaurantId: string,
    menuItemId: string,
    file: File
  ): Promise<string> => {
    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${menuItemId}-${Date.now()}.${fileExt}`;
      const filePath = `${restaurantId}/${fileName}`;
      
      // Upload file
      const { error } = await supabase.storage
        .from(BUCKET_MENU_ITEMS)
        .upload(filePath, file, {
          upsert: true
        });
      
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data } = supabase.storage
        .from(BUCKET_MENU_ITEMS)
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading menu item image:', error);
      throw error;
    }
  },
  
  // Upload profile image
  uploadProfileImage: async (
    userId: string,
    file: File
  ): Promise<string> => {
    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      
      // Upload file
      const { error } = await supabase.storage
        .from(BUCKET_PROFILE_IMAGES)
        .upload(fileName, file, {
          upsert: true
        });
      
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data } = supabase.storage
        .from(BUCKET_PROFILE_IMAGES)
        .getPublicUrl(fileName);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  },
  
  // Delete file from storage
  deleteFile: async (
    bucket: string,
    filePath: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting file from ${bucket}:`, error);
      throw error;
    }
  },
  
  // Get file URL from path
  getFileUrl: (bucket: string, filePath: string): string => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  },
  
  // Extract file path from URL
  extractFilePathFromUrl: (url: string): { bucket: string; path: string } | null => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // Format should be /storage/v1/object/public/bucket-name/file-path
      if (pathParts.length < 7) {
        return null;
      }
      
      const bucket = pathParts[5];
      const path = pathParts.slice(6).join('/');
      
      return { bucket, path };
    } catch (e) {
      console.error('Invalid URL format:', e);
      return null;
    }
  }
};