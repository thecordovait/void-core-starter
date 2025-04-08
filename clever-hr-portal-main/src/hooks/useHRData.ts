
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Employee = {
  empno: string;
  firstname: string;
  lastname: string;
  gender: string;
  birthdate: string;
  hiredate: string;
  sepdate: string | null;
};

export type Department = {
  deptcode: string;
  deptname: string;
};

export type Job = {
  jobcode: string;
  jobdesc: string;
};

export type JobHistory = {
  empno: string;
  jobcode: string;
  deptcode: string;
  effdate: string;
  salary: number;
  employee?: Employee;
  job?: Job;
  department?: Department;
};

export const useHRData = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobHistories, setJobHistories] = useState<JobHistory[]>([]);
  const [loading, setLoading] = useState({
    employees: true,
    departments: true,
    jobs: true,
    jobHistories: true
  });
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    setLoading(prev => ({ ...prev, employees: true }));
    try {
      const { data, error } = await supabase
        .from('employee')
        .select('*')
        .order('lastname', { ascending: true });
      
      if (error) throw error;
      setEmployees(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error fetching employees: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  };

  const fetchDepartments = async () => {
    setLoading(prev => ({ ...prev, departments: true }));
    try {
      const { data, error } = await supabase
        .from('department')
        .select('*')
        .order('deptname', { ascending: true });
      
      if (error) throw error;
      setDepartments(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error fetching departments: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, departments: false }));
    }
  };

  const fetchJobs = async () => {
    setLoading(prev => ({ ...prev, jobs: true }));
    try {
      const { data, error } = await supabase
        .from('job')
        .select('*')
        .order('jobdesc', { ascending: true });
      
      if (error) throw error;
      setJobs(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error fetching jobs: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, jobs: false }));
    }
  };

  const fetchJobHistories = async () => {
    setLoading(prev => ({ ...prev, jobHistories: true }));
    try {
      // First, get the basic job history records
      const { data: jobHistoryData, error: jobHistoryError } = await supabase
        .from('jobhistory')
        .select('*')
        .order('effdate', { ascending: false });
      
      if (jobHistoryError) throw jobHistoryError;
      
      // For each job history, fetch the related employee, job, and department data separately
      const enhancedData = await Promise.all(
        (jobHistoryData || []).map(async (history) => {
          // Get employee data
          const { data: employeeData } = await supabase
            .from('employee')
            .select('*')
            .eq('empno', history.empno)
            .single();

          // Get job data
          const { data: jobData } = await supabase
            .from('job')
            .select('*')
            .eq('jobcode', history.jobcode)
            .single();

          // Get department data if deptcode exists
          let departmentData = null;
          if (history.deptcode) {
            const { data: deptData } = await supabase
              .from('department')
              .select('*')
              .eq('deptcode', history.deptcode)
              .single();
            departmentData = deptData;
          }

          // Create a properly typed JobHistory object
          const jobHistoryEntry: JobHistory = {
            ...history,
            employee: employeeData || undefined,
            job: jobData || undefined,
            department: departmentData || undefined
          };

          return jobHistoryEntry;
        })
      );

      setJobHistories(enhancedData);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error fetching job histories: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, jobHistories: false }));
    }
  };

  const refreshAllData = () => {
    fetchEmployees();
    fetchDepartments();
    fetchJobs();
    fetchJobHistories();
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  return { 
    employees, 
    departments, 
    jobs, 
    jobHistories, 
    loading, 
    error,
    refreshAllData,
    fetchEmployees,
    fetchDepartments,
    fetchJobs,
    fetchJobHistories
  };
};
