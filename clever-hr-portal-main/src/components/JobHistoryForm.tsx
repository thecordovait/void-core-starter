import React, { useState, useEffect } from 'react';
import { useHRData, Employee, Department, Job, JobHistory } from '@/hooks/useHRData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobHistoryFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  currentJobHistory?: JobHistory | null;
  initialDepartment?: string;
}

const JobHistoryForm = ({ 
  isOpen, 
  onOpenChange, 
  onSuccess, 
  currentJobHistory = null,
  initialDepartment = ''
}: JobHistoryFormProps) => {
  const { employees, departments, jobs, fetchJobHistories } = useHRData();
  const [formData, setFormData] = useState({
    empno: '',
    jobcode: '',
    deptcode: '',
    effdate: format(new Date(), 'yyyy-MM-dd'),
    salary: ''
  });
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    if (currentJobHistory) {
      setFormData({
        empno: currentJobHistory.empno,
        jobcode: currentJobHistory.jobcode,
        deptcode: currentJobHistory.deptcode || '',
        effdate: currentJobHistory.effdate,
        salary: currentJobHistory.salary?.toString() || ''
      });
    } else {
      setFormData({
        empno: '',
        jobcode: '',
        deptcode: initialDepartment || '',
        effdate: format(new Date(), 'yyyy-MM-dd'),
        salary: ''
      });
    }
  }, [currentJobHistory, isOpen, initialDepartment]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsMutating(true);
    try {
      const jobHistoryData = {
        empno: formData.empno,
        jobcode: formData.jobcode,
        deptcode: formData.deptcode || null,
        effdate: formData.effdate,
        salary: formData.salary ? parseFloat(formData.salary) : null
      };

      let result;
      if (currentJobHistory) {
        result = await supabase
          .from('jobhistory')
          .update(jobHistoryData)
          .eq('empno', currentJobHistory.empno)
          .eq('effdate', currentJobHistory.effdate)
          .eq('jobcode', currentJobHistory.jobcode);
      } else {
        result = await supabase
          .from('jobhistory')
          .insert(jobHistoryData);
      }

      if (result.error) throw result.error;
      
      toast.success(currentJobHistory 
        ? 'Job history updated successfully' 
        : 'Employee assigned to department successfully'
      );
      
      fetchJobHistories();
      
      if (onSuccess) onSuccess();
      
      onOpenChange(false);
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsMutating(false);
    }
  };

  const isFormValid = () => {
    return formData.empno && formData.jobcode && formData.effdate;
  };

  const getEmployeeFullName = (employee: Employee) => {
    return `${employee.firstname || ''} ${employee.lastname || ''}`.trim() || employee.empno;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {currentJobHistory ? 'Edit Job Assignment' : 'Assign Employee to Department'}
          </DialogTitle>
          <DialogDescription>
            {currentJobHistory 
              ? 'Update the job and department assignment details.'
              : 'Assign an employee to a department with a specific job role.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="empno" className="text-right">
              Employee
            </Label>
            <div className="col-span-3">
              <Select
                disabled={!!currentJobHistory}
                value={formData.empno}
                onValueChange={(value) => handleSelectChange('empno', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.empno} value={employee.empno}>
                      {getEmployeeFullName(employee)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="jobcode" className="text-right">
              Job
            </Label>
            <div className="col-span-3">
              <Select
                disabled={!!currentJobHistory}
                value={formData.jobcode}
                onValueChange={(value) => handleSelectChange('jobcode', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.jobcode} value={job.jobcode}>
                      {job.jobdesc || job.jobcode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deptcode" className="text-right">
              Department
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.deptcode}
                onValueChange={(value) => handleSelectChange('deptcode', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.deptcode} value={dept.deptcode}>
                      {dept.deptname || dept.deptcode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="effdate" className="text-right">
              Effective Date
            </Label>
            <Input
              id="effdate"
              name="effdate"
              type="date"
              value={formData.effdate}
              onChange={handleInputChange}
              className="col-span-3"
              disabled={!!currentJobHistory}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="salary" className="text-right">
              Salary
            </Label>
            <Input
              id="salary"
              name="salary"
              type="number"
              value={formData.salary}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="Enter salary amount"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid() || isMutating}
          >
            {isMutating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {currentJobHistory ? 'Updating...' : 'Saving...'}
              </>
            ) : currentJobHistory ? 'Update Assignment' : 'Assign Employee'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobHistoryForm;
