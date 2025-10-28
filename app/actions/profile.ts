'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { updateProfileSchema } from '@/lib/validation/schemas';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  const data = {
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    bio: formData.get('bio'),
  };
  
  const validation = updateProfileSchema.safeParse(data);
  if (!validation.success) {
    throw new Error('Invalid profile data');
  }
  
  const { error } = await supabase
    .from('profiles')
    .update(validation.data)
    .eq('id', user.id);
  
  if (error) throw error;
  
  revalidatePath('/profile');
  return { success: true };
}

export async function updateProfileWithObject(data: {
  full_name?: string;
  phone?: string;
  bio?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other' | '';
  location?: string;
  photo_url?: string;
}) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  const validation = updateProfileSchema.safeParse(data);
  if (!validation.success) {
    throw new Error('Invalid profile data');
  }
  
  const { error } = await supabase
    .from('profiles')
    .update(validation.data)
    .eq('id', user.id);
  
  if (error) throw error;
  
  revalidatePath('/profile');
  return { success: true };
}

export async function getProfile() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }
  
  return profile;
}
