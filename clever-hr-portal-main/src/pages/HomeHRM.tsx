
import React from 'react';
import { useHRData } from '@/hooks/useHRData';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { Users, Building2, ClipboardList } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const HomeHRM = () => {
  const { employees, departments, jobHistories, loading } = useHRData();
  
  const recentJobHistories = jobHistories.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Employees" 
            value={loading.employees ? '...' : employees.length}
            icon={<Users className="h-6 w-6" />}
          />
          <StatCard 
            title="Total Departments" 
            value={loading.departments ? '...' : departments.length}
            icon={<Building2 className="h-6 w-6" />}
          />
          <StatCard 
            title="Recent Job Changes" 
            value={loading.jobHistories ? '...' : jobHistories.length}
            icon={<ClipboardList className="h-6 w-6" />}
          />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Job History</h2>
          
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
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead className="text-right">Salary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentJobHistories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No job history records found
                    </TableCell>
                  </TableRow>
                ) : (
                  recentJobHistories.map((history) => (
                    <TableRow key={`${history.empno}-${history.jobcode}-${history.effdate}`}>
                      <TableCell>
                        {history.employee ? 
                          `${history.employee.firstname || ''} ${history.employee.lastname || ''}`.trim() || 
                          history.empno : 
                          history.empno}
                      </TableCell>
                      <TableCell>
                        {history.department?.deptname || history.deptcode || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {history.job?.jobdesc || history.jobcode || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {history.effdate ? format(new Date(history.effdate), 'MMM d, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        {history.salary ? 
                          new Intl.NumberFormat('en-US', { 
                            style: 'currency', 
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0 
                          }).format(history.salary) : 
                          'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HomeHRM;
