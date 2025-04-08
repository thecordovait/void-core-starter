import React, { useState } from 'react';
import { useHRData, JobHistory } from '@/hooks/useHRData';
import DashboardLayout from '@/components/DashboardLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, Search, Edit, Trash2, Loader2 
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import JobHistoryForm from '@/components/JobHistoryForm';

const JobHistoryPage = () => {
  const { jobHistories, loading, fetchJobHistories } = useHRData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [currentJobHistory, setCurrentJobHistory] = useState<JobHistory | null>(null);

  const filteredJobHistories = jobHistories.filter(history => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      history.employee?.firstname?.toLowerCase().includes(searchTermLower) ||
      history.employee?.lastname?.toLowerCase().includes(searchTermLower) ||
      history.employee?.empno.toLowerCase().includes(searchTermLower) ||
      history.job?.jobdesc?.toLowerCase().includes(searchTermLower) ||
      history.department?.deptname?.toLowerCase().includes(searchTermLower)
    );
  });

  const handleEditClick = (jobHistory: JobHistory) => {
    setCurrentJobHistory(jobHistory);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (jobHistory: JobHistory) => {
    setCurrentJobHistory(jobHistory);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteJobHistory = async () => {
    if (!currentJobHistory) return;
    setIsMutating(true);
    try {
      const { error } = await supabase
        .from('jobhistory')
        .delete()
        .eq('empno', currentJobHistory.empno)
        .eq('effdate', currentJobHistory.effdate)
        .eq('jobcode', currentJobHistory.jobcode);

      if (error) throw error;
      
      toast.success('Job history entry deleted successfully');
      fetchJobHistories();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(`Error deleting job history: ${error.message}`);
    } finally {
      setIsMutating(false);
    }
  };

  const getEmployeeName = (jobHistory: JobHistory) => {
    if (!jobHistory.employee) return 'N/A';
    return `${jobHistory.employee.firstname || ''} ${jobHistory.employee.lastname || ''}`.trim() || jobHistory.employee.empno;
  };

  const handleJobHistorySuccess = () => {
    fetchJobHistories();
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setCurrentJobHistory(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold">Job History</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search job history..."
                className="pl-8 w-full md:w-60"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Job History
            </Button>
          </div>
        </div>

        {loading.jobHistories ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobHistories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No job history entries found
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobHistories.map((history) => (
                  <TableRow key={`${history.empno}-${history.effdate}-${history.jobcode}`}>
                    <TableCell>{getEmployeeName(history)}</TableCell>
                    <TableCell>{history.job?.jobdesc || history.jobcode}</TableCell>
                    <TableCell>{history.department?.deptname || 'N/A'}</TableCell>
                    <TableCell>{format(new Date(history.effdate), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      {history.salary ? `$${history.salary.toLocaleString()}` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditClick(history)}
                        title="Edit Job History"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteClick(history)}
                        title="Delete Job History"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        <JobHistoryForm
          isOpen={isAddDialogOpen || isEditDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddDialogOpen(false);
              setIsEditDialogOpen(false);
              setCurrentJobHistory(null);
            }
          }}
          onSuccess={handleJobHistorySuccess}
          currentJobHistory={isEditDialogOpen ? currentJobHistory : null}
        />

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this job history entry?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the job history record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteJobHistory}
                disabled={isMutating}
                className="bg-red-600 hover:bg-red-700"
              >
                {isMutating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default JobHistoryPage;
