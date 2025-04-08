
import React, { useState, useEffect } from 'react';
import { useHRData, Department, JobHistory } from '@/hooks/useHRData';
import DashboardLayout from '@/components/DashboardLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Edit, Trash2, Users, UserPlus, Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import JobHistoryForm from '@/components/JobHistoryForm';

const Departments = () => {
  const { departments, jobHistories, loading, fetchDepartments, fetchJobHistories } = useHRData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignEmployeeDialogOpen, setIsAssignEmployeeDialogOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    deptcode: '',
    deptname: ''
  });
  const [departmentEmployeeCounts, setDepartmentEmployeeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!loading.jobHistories) {
      // Calculate employee counts per department based on job history
      const counts: Record<string, Set<string>> = {};

      jobHistories.forEach(history => {
        if (history.deptcode) {
          if (!counts[history.deptcode]) {
            counts[history.deptcode] = new Set();
          }
          counts[history.deptcode].add(history.empno);
        }
      });

      // Convert sets to counts
      const employeeCounts: Record<string, number> = {};
      Object.keys(counts).forEach(deptcode => {
        employeeCounts[deptcode] = counts[deptcode].size;
      });

      setDepartmentEmployeeCounts(employeeCounts);
    }
  }, [jobHistories, loading.jobHistories]);

  const filteredDepartments = departments.filter(dept => 
    dept.deptname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.deptcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      deptcode: '',
      deptname: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDepartment = async () => {
    setIsMutating(true);
    try {
      const { data, error } = await supabase
        .from('department')
        .insert({
          deptcode: formData.deptcode,
          deptname: formData.deptname || null
        })
        .select();

      if (error) throw error;
      
      toast.success('Department added successfully');
      fetchDepartments();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(`Error adding department: ${error.message}`);
    } finally {
      setIsMutating(false);
    }
  };

  const handleEditClick = (department: Department) => {
    setCurrentDepartment(department);
    setFormData({
      deptcode: department.deptcode,
      deptname: department.deptname || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (department: Department) => {
    setCurrentDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  const handleAssignEmployeeClick = (department: Department) => {
    setCurrentDepartment(department);
    setIsAssignEmployeeDialogOpen(true);
  };

  const handleUpdateDepartment = async () => {
    if (!currentDepartment) return;
    setIsMutating(true);
    try {
      const { error } = await supabase
        .from('department')
        .update({
          deptname: formData.deptname || null
        })
        .eq('deptcode', currentDepartment.deptcode);

      if (error) throw error;
      
      toast.success('Department updated successfully');
      fetchDepartments();
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast.error(`Error updating department: ${error.message}`);
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!currentDepartment) return;
    setIsMutating(true);
    try {
      const { error } = await supabase
        .from('department')
        .delete()
        .eq('deptcode', currentDepartment.deptcode);

      if (error) throw error;
      
      toast.success('Department deleted successfully');
      fetchDepartments();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(`Error deleting department: ${error.message}`);
    } finally {
      setIsMutating(false);
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold">Departments</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search departments..."
                className="pl-8 w-full md:w-60"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Department</DialogTitle>
                  <DialogDescription>
                    Enter the department details below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="deptcode" className="text-right">Department Code</Label>
                    <Input
                      id="deptcode"
                      name="deptcode"
                      value={formData.deptcode}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="deptname" className="text-right">Department Name</Label>
                    <Input
                      id="deptname"
                      name="deptname"
                      value={formData.deptname}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={handleAddDepartment} 
                    disabled={!formData.deptcode || isMutating}
                  >
                    {isMutating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : 'Add Department'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading.departments || loading.jobHistories ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Code</TableHead>
                <TableHead>Department Name</TableHead>
                <TableHead>Employees Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No departments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments.map((department) => (
                  <TableRow key={department.deptcode}>
                    <TableCell className="font-medium">
                      <Link 
                        to={`/departments/${department.deptcode}`} 
                        className="hover:text-primary hover:underline"
                      >
                        {department.deptcode}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link 
                        to={`/departments/${department.deptcode}`} 
                        className="hover:text-primary hover:underline"
                      >
                        {department.deptname || 'N/A'}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-hr-primary" />
                        <span>{departmentEmployeeCounts[department.deptcode] || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleAssignEmployeeClick(department)}
                        title="Assign Employees"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditClick(department)}
                        title="Edit Department"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteClick(department)}
                        title="Delete Department"
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
              <DialogDescription>
                Update the department details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-deptcode" className="text-right">Department Code</Label>
                <Input
                  id="edit-deptcode"
                  value={formData.deptcode}
                  className="col-span-3"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-deptname" className="text-right">Department Name</Label>
                <Input
                  id="edit-deptname"
                  name="deptname"
                  value={formData.deptname}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleUpdateDepartment} 
                disabled={isMutating}
              >
                {isMutating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : 'Update Department'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this department?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the department.
                {departmentEmployeeCounts[currentDepartment?.deptcode || ''] > 0 && (
                  <div className="mt-2 text-red-500">
                    Warning: This department has {departmentEmployeeCounts[currentDepartment?.deptcode || '']} 
                    {' '}employee(s) associated with it.
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteDepartment}
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

        {/* Assign Employee Dialog */}
        <JobHistoryForm
          isOpen={isAssignEmployeeDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsAssignEmployeeDialogOpen(false);
            }
          }}
          onSuccess={handleAssignEmployeeSuccess}
          currentJobHistory={null}
          initialDepartment={currentDepartment?.deptcode}
        />
      </div>
    </DashboardLayout>
  );
};

export default Departments;
