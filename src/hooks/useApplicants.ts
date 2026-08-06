import { useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Applicant {
  id: number;
  user_id: number;
  full_name: string;
  dob: string;
  address: string;
  nationality: string;
  program_of_interest: string;
  created_at: string;
}

export type NewApplicant = Omit<Applicant, 'id' | 'created_at'>;
export type UpdateApplicant = Partial<NewApplicant>;

export function useApplicants() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getApplicants = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Applicant[];
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applicants');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getApplicantByUserId = async (userId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
      return data as Applicant | null;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applicant');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createApplicant = async (applicant: NewApplicant) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('applicants')
        .insert([applicant])
        .select()
        .single();

      if (error) throw error;
      return data as Applicant;
    } catch (err: any) {
      setError(err.message || 'Failed to create applicant');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicant = async (id: number, updates: UpdateApplicant) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('applicants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Applicant;
    } catch (err: any) {
      setError(err.message || 'Failed to update applicant');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteApplicant = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('applicants')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete applicant');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getApplicants,
    getApplicantByUserId,
    createApplicant,
    updateApplicant,
    deleteApplicant
  };
}
