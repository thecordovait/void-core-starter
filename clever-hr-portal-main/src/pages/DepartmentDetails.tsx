
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useHRData, JobHistory } from '@/hooks/useHRData';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChevronLeft, UserPlus } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import JobHistoryForm from '@/components/JobHistoryForm';
import { toast } from 'sonner';

const DepartmentDetails = () => {
  const { deptcode } = useParams();
  const { departments, jobHistories, loading, fetchJobHistories, fetchDepartments } = useHRData();
  const [isAssignEmployeeDialogOpen, setIsAssignEmployeeDialogOpen] = useState(false);
  
  const department = departments.find(dept => dept.deptcode === deptcode);
  
  // Filter job histories for the current department
  const departmentEmployees = jobHistories.filter(history => history.deptcode === deptcode);
  
  // Get unique employees from job histories (to avoid duplicates)
  const uniqueEmployees = departmentEmployees.reduce((acc: JobHistory[], current) => {
    // Check if employee is already in our accumulator array
    const isDuplicate = acc.find(item => item.empno === current.empno);
    if (!isDuplicate) {
      return [...acc, current];
    }
    return acc;
  }, []);

  const getEmployeeName = (jobHistory: JobHistory) => {
    if (!jobHistory.employee) return 'N/A';
    return `${jobHistory.employee.firstname || ''} ${jobHistory.employee.lastname || ''}`.trim() || jobHistory.employee.empno;
  };

  const handleAssignEmployeeSuccess = () => {
    // Refresh the job histories and department data
    fetchJobHistories();
    fetchDepartments();
    
    // Close the assign employee dialog
    setIsAssignEmployeeDialogOpen(false);
    
    // Show success toast
    toast.success('Employee assigned successfully');
  };

  if (loading.departments || loading.jobHistories) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!department) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-bold">Department Not Found</h1>
          <p className="text-muted-foreground mt-2">The department you're looking for doesn't exist or has been removed.</p>
          <Button asChild className="mt-6">
            <Link to="/departments">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Departments
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <Link 
              to="/departments" 
              className="text-sm text-muted-foreground flex items-center hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Departments
            </Link>
            <h1 className="text-2xl font-bold">{department.deptname || department.deptcode}</h1>
            <p className="text-muted-foreground">Department Code: {department.deptcode}</p>
          </div>
          <Button onClick={() => setIsAssignEmployeeDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Assign Employee
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Employees in Department</CardTitle>
            <CardDescription>
              All employees currently assigned to this department
            </CardDescription>
          </CardHeader>
          <CardContent>
            {uniqueEmployees.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No employees currently assigned to this department
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Salary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uniqueEmployees.map((history) => (
                    <TableRow key={`${history.empno}-${history.effdate}-${history.jobcode}`}>
                      <TableCell>{getEmployeeName(history)}</TableCell>
                      <TableCell>{history.job?.jobdesc || history.jobcode}</TableCell>
                      <TableCell>{format(new Date(history.effdate), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        {history.salary ? `$${history.salary.toLocaleString()}` : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Job history entries for the department */}
        <Card>
          <CardHeader>
            <CardTitle>Job History</CardTitle>
            <CardDescription>
              All job history entries related to this department
            </CardDescription>
          </CardHeader>
          <CardContent>
            {departmentEmployees.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No job history entries for this department
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Salary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentEmployees.map((history) => (
                    <TableRow key={`${history.empno}-${history.effdate}-${history.jobcode}`}>
                      <TableCell>{getEmployeeName(history)}</TableCell>
                      <TableCell>{history.job?.jobdesc || history.jobcode}</TableCell>
                      <TableCell>{format(new Date(history.effdate), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        {history.salary ? `$${history.salary.toLocaleString()}` : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <JobHistoryForm
          isOpen={isAssignEmployeeDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsAssignEmployeeDialogOpen(false);
            }
          }}
          onSuccess={handleAssignEmployeeSuccess}
          currentJobHistory={null}
          initialDepartment={department.deptcode}
        />
      </div>
    </DashboardLayout>
  );
};

export default DepartmentDetails;
