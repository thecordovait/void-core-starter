
import React, { useState } from 'react';
import { useHRData, Employee } from '@/hooks/useHRData';
import DashboardLayout from '@/components/DashboardLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, Search, Edit, Trash2, X, Check, Loader2 
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Employees = () => {
  const { employees, loading, fetchEmployees } = useHRData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    empno: '',
    firstname: '',
    lastname: '',
    gender: '',
    birthdate: '',
    hiredate: '',
    sepdate: ''
  });

  const filteredEmployees = employees.filter(emp => 
    emp.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.empno.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      empno: '',
      firstname: '',
      lastname: '',
      gender: '',
      birthdate: '',
      hiredate: '',
      sepdate: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = async () => {
    setIsMutating(true);
    try {
      const { data, error } = await supabase
        .from('employee')
        .insert({
          empno: formData.empno,
          firstname: formData.firstname || null,
          lastname: formData.lastname || null,
          gender: formData.gender || null,
          birthdate: formData.birthdate || null,
          hiredate: formData.hiredate || null,
          sepdate: formData.sepdate || null
        })
        .select();

      if (error) throw error;
      
      toast.success('Employee added successfully');
      fetchEmployees();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(`Error adding employee: ${error.message}`);
    } finally {
      setIsMutating(false);
    }
  };

  const handleEditClick = (employee: Employee) => {
    setCurrentEmployee(employee);
    setFormData({
      empno: employee.empno,
      firstname: employee.firstname || '',
      lastname: employee.lastname || '',
      gender: employee.gender || '',
      birthdate: employee.birthdate || '',
      hiredate: employee.hiredate || '',
      sepdate: employee.sepdate || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateEmployee = async () => {
    if (!currentEmployee) return;
    setIsMutating(true);
    try {
      const { error } = await supabase
        .from('employee')
        .update({
          firstname: formData.firstname || null,
          lastname: formData.lastname || null,
          gender: formData.gender || null,
          birthdate: formData.birthdate || null,
          hiredate: formData.hiredate || null,
          sepdate: formData.sepdate || null
        })
        .eq('empno', currentEmployee.empno);

      if (error) throw error;
      
      toast.success('Employee updated successfully');
      fetchEmployees();
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast.error(`Error updating employee: ${error.message}`);
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!currentEmployee) return;
    setIsMutating(true);
    try {
      const { error } = await supabase
        .from('employee')
        .delete()
        .eq('empno', currentEmployee.empno);

      if (error) throw error;
      
      toast.success('Employee deleted successfully');
      fetchEmployees();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(`Error deleting employee: ${error.message}`);
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold">Employees</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search employees..."
                className="pl-8 w-full md:w-60"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>
                    Enter the employee details below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="empno" className="text-right">Employee No.</Label>
                    <Input
                      id="empno"
                      name="empno"
                      value={formData.empno}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="firstname" className="text-right">First Name</Label>
                    <Input
                      id="firstname"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="lastname" className="text-right">Last Name</Label>
                    <Input
                      id="lastname"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="gender" className="text-right">Gender</Label>
                    <Input
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="M or F"
                      maxLength={1}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="birthdate" className="text-right">Birth Date</Label>
                    <Input
                      id="birthdate"
                      name="birthdate"
                      type="date"
                      value={formData.birthdate}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="hiredate" className="text-right">Hire Date</Label>
                    <Input
                      id="hiredate"
                      name="hiredate"
                      type="date"
                      value={formData.hiredate}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={handleAddEmployee} 
                    disabled={!formData.empno || isMutating}
                  >
                    {isMutating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : 'Add Employee'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading.employees ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Birth Date</TableHead>
                <TableHead>Hire Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.empno}>
                    <TableCell className="font-medium">{employee.empno}</TableCell>
                    <TableCell>
                      {`${employee.firstname || ''} ${employee.lastname || ''}`.trim() || 'N/A'}
                    </TableCell>
                    <TableCell>{employee.gender || 'N/A'}</TableCell>
                    <TableCell>
                      {employee.birthdate ? format(new Date(employee.birthdate), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {employee.hiredate ? format(new Date(employee.hiredate), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditClick(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteClick(employee)}
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
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>
                Update the employee details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-empno" className="text-right">Employee No.</Label>
                <Input
                  id="edit-empno"
                  value={formData.empno}
                  className="col-span-3"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-firstname" className="text-right">First Name</Label>
                <Input
                  id="edit-firstname"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-lastname" className="text-right">Last Name</Label>
                <Input
                  id="edit-lastname"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-gender" className="text-right">Gender</Label>
                <Input
                  id="edit-gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="M or F"
                  maxLength={1}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-birthdate" className="text-right">Birth Date</Label>
                <Input
                  id="edit-birthdate"
                  name="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-hiredate" className="text-right">Hire Date</Label>
                <Input
                  id="edit-hiredate"
                  name="hiredate"
                  type="date"
                  value={formData.hiredate}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-sepdate" className="text-right">Separation Date</Label>
                <Input
                  id="edit-sepdate"
                  name="sepdate"
                  type="date"
                  value={formData.sepdate || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleUpdateEmployee} 
                disabled={isMutating}
              >
                {isMutating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : 'Update Employee'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this employee?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the employee
                and remove all associated job history records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteEmployee}
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

export default Employees;
