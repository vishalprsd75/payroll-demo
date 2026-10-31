// ─── Meridian Payroll – Demo Data ─────────────────────────────────────────────
import type {
  Department, Employee, SalaryStructure, SalaryComponent,
  AttendanceSummary, PayrollRun, PayrollItem, PayrollException,
  LeaveBalance, PayrollActivity, Announcement, DemoUser, Payslip,
  LeaveRequest, ReadinessItem
} from '../types';

// ─── Departments ─────────────────────────────────────────────────────────────
export const departments: Department[] = [
  { id: 'dept-1', name: 'Engineering', headId: 'emp-1', employeeCount: 10, color: '#0D9488' },
  { id: 'dept-2', name: 'Product & Design', headId: 'emp-5', employeeCount: 5, color: '#6366F1' },
  { id: 'dept-3', name: 'Sales & Marketing', headId: 'emp-11', employeeCount: 6, color: '#F59E0B' },
  { id: 'dept-4', name: 'Human Resources', headId: 'emp-17', employeeCount: 4, color: '#EC4899' },
  { id: 'dept-5', name: 'Finance & Accounts', headId: 'emp-21', employeeCount: 3, color: '#10B981' },
  { id: 'dept-6', name: 'Operations', headId: 'emp-24', employeeCount: 2, color: '#8B5CF6' },
];

// ─── Salary Component Templates ──────────────────────────────────────────────
function buildSalaryStructure(basic: number, name: string): SalaryStructure {
  const hra = Math.round(basic * 0.40);
  const conveyance = 1600;
  const specialAllowance = Math.round(basic * 0.20);
  const grossSalary = basic + hra + conveyance + specialAllowance;

  const pfEmployee = Math.min(Math.round(basic * 0.12), 1800);
  const professionalTax = grossSalary > 25000 ? 200 : grossSalary > 15000 ? 150 : 0;
  const annualGross = grossSalary * 12;
  const tds = annualGross > 1000000 ? Math.round((annualGross * 0.20) / 12) :
              annualGross > 750000 ? Math.round((annualGross * 0.15) / 12) :
              annualGross > 500000 ? Math.round((annualGross * 0.10) / 12) :
              annualGross > 300000 ? Math.round((annualGross * 0.05) / 12) : 0;
  const esi = grossSalary <= 21000 ? Math.round(grossSalary * 0.0075) : 0;

  const totalDeductions = pfEmployee + professionalTax + tds + esi;
  const netSalary = grossSalary - totalDeductions;

  const components: SalaryComponent[] = [
    { id: `sc-basic-${name}`, name: 'Basic Salary', type: 'earning', category: 'basic', calculationType: 'fixed', value: basic, isStatutory: false, isConfigurable: true },
    { id: `sc-hra-${name}`, name: 'House Rent Allowance', type: 'earning', category: 'hra', calculationType: 'percentage_of_basic', value: 40, isStatutory: false, isConfigurable: true, description: '40% of Basic Salary' },
    { id: `sc-conv-${name}`, name: 'Conveyance Allowance', type: 'earning', category: 'conveyance', calculationType: 'fixed', value: conveyance, isStatutory: false, isConfigurable: true },
    { id: `sc-special-${name}`, name: 'Special Allowance', type: 'earning', category: 'special', calculationType: 'percentage_of_basic', value: 20, isStatutory: false, isConfigurable: true, description: '20% of Basic Salary' },
    { id: `sc-pf-${name}`, name: 'Employee PF', type: 'deduction', category: 'pf', calculationType: 'percentage_of_basic', value: 12, isStatutory: true, isConfigurable: false, description: '12% of Basic (capped at ₹1,800)' },
    { id: `sc-pt-${name}`, name: 'Professional Tax', type: 'deduction', category: 'professional_tax', calculationType: 'fixed', value: professionalTax, isStatutory: true, isConfigurable: false },
    { id: `sc-tds-${name}`, name: 'TDS', type: 'deduction', category: 'tds', calculationType: 'fixed', value: tds, isStatutory: true, isConfigurable: true, description: 'Based on annual income slab' },
    ...(esi > 0 ? [{ id: `sc-esi-${name}`, name: 'ESI', type: 'deduction' as const, category: 'esi' as const, calculationType: 'percentage_of_gross' as const, value: 0.75, isStatutory: true, isConfigurable: false, description: '0.75% of Gross (if gross ≤ ₹21,000)' }] : []),
  ];

  return {
    id: `ss-${name}`,
    name,
    components,
    grossSalary,
    totalDeductions,
    netSalary,
    annualCTC: grossSalary * 12 + pfEmployee * 12 + Math.round(basic * 0.0481) * 12,
  };
}

export const salaryStructures: Record<string, SalaryStructure> = {
  'senior-engineer': buildSalaryStructure(62500, 'senior-engineer'),
  'engineer': buildSalaryStructure(45000, 'engineer'),
  'junior-engineer': buildSalaryStructure(30000, 'junior-engineer'),
  'lead': buildSalaryStructure(80000, 'lead'),
  'manager': buildSalaryStructure(75000, 'manager'),
  'senior-manager': buildSalaryStructure(90000, 'senior-manager'),
  'director': buildSalaryStructure(110000, 'director'),
  'designer': buildSalaryStructure(50000, 'designer'),
  'senior-designer': buildSalaryStructure(65000, 'senior-designer'),
  'analyst': buildSalaryStructure(35000, 'analyst'),
  'executive': buildSalaryStructure(28000, 'executive'),
  'associate': buildSalaryStructure(25000, 'associate'),
  'intern': buildSalaryStructure(15000, 'intern'),
};

// ─── Employees (30) ──────────────────────────────────────────────────────────
export const employees: Employee[] = [
  // Engineering (10)
  { id: 'emp-1', employeeId: 'MRD-1001', firstName: 'Arjun', lastName: 'Mehta', email: 'arjun.mehta@meridian.io', phone: '9876543210', dateOfBirth: '1988-03-15', gender: 'male', address: '42, Sector 15, Gurugram', city: 'Gurugram', state: 'Haryana', pincode: '122001', departmentId: 'dept-1', designationId: 'des-1', designation: 'Engineering Lead', department: 'Engineering', joiningDate: '2020-04-01', status: 'active', salaryStructureId: 'lead', bankDetails: { bankName: 'HDFC Bank', accountNumber: '50100XXXX4523', ifscCode: 'HDFC0001234', branchName: 'Cyber City Branch' }, taxInfo: { panNumber: 'ABCPM1234A', uanNumber: '100123456789', taxRegime: 'new' } },
  { id: 'emp-2', employeeId: 'MRD-1002', firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@meridian.io', phone: '9876543211', dateOfBirth: '1992-07-22', gender: 'female', address: '15, Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', departmentId: 'dept-1', designationId: 'des-2', designation: 'Senior Software Engineer', department: 'Engineering', joiningDate: '2021-01-15', status: 'active', salaryStructureId: 'senior-engineer', bankDetails: { bankName: 'ICICI Bank', accountNumber: '00220XXXX8901', ifscCode: 'ICIC0004567', branchName: 'Indiranagar Branch' }, taxInfo: { panNumber: 'DEFPS5678B', uanNumber: '100234567890', taxRegime: 'old' } },
  { id: 'emp-3', employeeId: 'MRD-1003', firstName: 'Vikram', lastName: 'Reddy', email: 'vikram.reddy@meridian.io', phone: '9876543212', dateOfBirth: '1993-11-08', gender: 'male', address: '78, Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034', departmentId: 'dept-1', designationId: 'des-3', designation: 'Software Engineer', department: 'Engineering', joiningDate: '2022-06-01', status: 'active', salaryStructureId: 'engineer', bankDetails: { bankName: 'SBI', accountNumber: '31230XXXX5678', ifscCode: 'SBIN0012345', branchName: 'Banjara Hills Branch' }, taxInfo: { panNumber: 'GHIVR9012C', uanNumber: '100345678901', taxRegime: 'new' } },
  { id: 'emp-4', employeeId: 'MRD-1004', firstName: 'Neha', lastName: 'Gupta', email: 'neha.gupta@meridian.io', phone: '9876543213', dateOfBirth: '1995-01-30', gender: 'female', address: '23, Powai', city: 'Mumbai', state: 'Maharashtra', pincode: '400076', departmentId: 'dept-1', designationId: 'des-3', designation: 'Software Engineer', department: 'Engineering', joiningDate: '2022-08-15', status: 'active', salaryStructureId: 'engineer', bankDetails: { bankName: 'Kotak Mahindra Bank', accountNumber: '98760XXXX1234', ifscCode: 'KKBK0005678', branchName: 'Powai Branch' }, taxInfo: { panNumber: 'JKLNG3456D', uanNumber: '100456789012', taxRegime: 'new' } },
  { id: 'emp-5a', employeeId: 'MRD-1005', firstName: 'Rohit', lastName: 'Patel', email: 'rohit.patel@meridian.io', phone: '9876543214', dateOfBirth: '1994-05-12', gender: 'male', address: '56, Vastrapur', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', departmentId: 'dept-1', designationId: 'des-4', designation: 'Junior Software Engineer', department: 'Engineering', joiningDate: '2023-01-10', status: 'active', salaryStructureId: 'junior-engineer', bankDetails: { bankName: 'Bank of Baroda', accountNumber: '45670XXXX9012', ifscCode: 'BARB0009012', branchName: 'Vastrapur Branch' }, taxInfo: { panNumber: 'MNORP7890E', uanNumber: '100567890123', taxRegime: 'new' } },
  { id: 'emp-6', employeeId: 'MRD-1006', firstName: 'Ananya', lastName: 'Krishnan', email: 'ananya.krishnan@meridian.io', phone: '9876543215', dateOfBirth: '1991-09-17', gender: 'female', address: '34, Adyar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600020', departmentId: 'dept-1', designationId: 'des-2', designation: 'Senior Software Engineer', department: 'Engineering', joiningDate: '2021-07-01', status: 'active', salaryStructureId: 'senior-engineer', bankDetails: { bankName: 'Axis Bank', accountNumber: '12340XXXX5678', ifscCode: 'UTIB0003456', branchName: 'Adyar Branch' }, taxInfo: { panNumber: 'PQRAK1234F', uanNumber: '100678901234', taxRegime: 'old' } },
  { id: 'emp-7', employeeId: 'MRD-1007', firstName: 'Siddharth', lastName: 'Joshi', email: 'siddharth.joshi@meridian.io', phone: '9876543216', dateOfBirth: '1996-12-03', gender: 'male', address: '90, Koregaon Park', city: 'Pune', state: 'Maharashtra', pincode: '411001', departmentId: 'dept-1', designationId: 'des-3', designation: 'Software Engineer', department: 'Engineering', joiningDate: '2023-03-20', status: 'active', salaryStructureId: 'engineer', bankDetails: { bankName: 'HDFC Bank', accountNumber: '50100XXXX7890', ifscCode: 'HDFC0007890', branchName: 'Koregaon Park Branch' }, taxInfo: { panNumber: 'STUSJ5678G', uanNumber: '100789012345', taxRegime: 'new' } },
  { id: 'emp-8', employeeId: 'MRD-1008', firstName: 'Kavitha', lastName: 'Nair', email: 'kavitha.nair@meridian.io', phone: '9876543217', dateOfBirth: '1997-04-25', gender: 'female', address: '12, MG Road', city: 'Kochi', state: 'Kerala', pincode: '682016', departmentId: 'dept-1', designationId: 'des-4', designation: 'Junior Software Engineer', department: 'Engineering', joiningDate: '2024-01-08', status: 'active', salaryStructureId: 'junior-engineer', bankDetails: { bankName: 'Federal Bank', accountNumber: '67890XXXX1234', ifscCode: 'FDRL0001234', branchName: 'MG Road Branch' }, taxInfo: { panNumber: 'VWXKN9012H', uanNumber: '100890123456', taxRegime: 'new' } },
  { id: 'emp-9', employeeId: 'MRD-1009', firstName: 'Aditya', lastName: 'Singh', email: 'aditya.singh@meridian.io', phone: '9876543218', dateOfBirth: '1998-08-14', gender: 'male', address: '45, Gomti Nagar', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226010', departmentId: 'dept-1', designationId: 'des-4', designation: 'Junior Software Engineer', department: 'Engineering', joiningDate: '2024-06-01', status: 'probation', salaryStructureId: 'junior-engineer' },
  { id: 'emp-10', employeeId: 'MRD-1010', firstName: 'Meera', lastName: 'Iyer', email: 'meera.iyer@meridian.io', phone: '9876543219', dateOfBirth: '1999-02-28', gender: 'female', address: '67, HSR Layout', city: 'Bengaluru', state: 'Karnataka', pincode: '560102', departmentId: 'dept-1', designationId: 'des-5', designation: 'Engineering Intern', department: 'Engineering', joiningDate: '2024-09-01', status: 'active', salaryStructureId: 'intern' },

  // Product & Design (5)
  { id: 'emp-5', employeeId: 'MRD-1011', firstName: 'Deepika', lastName: 'Rao', email: 'deepika.rao@meridian.io', phone: '9876543220', dateOfBirth: '1990-06-10', gender: 'female', address: '89, Whitefield', city: 'Bengaluru', state: 'Karnataka', pincode: '560066', departmentId: 'dept-2', designationId: 'des-6', designation: 'Product Lead', department: 'Product & Design', joiningDate: '2020-08-01', status: 'active', salaryStructureId: 'lead', bankDetails: { bankName: 'HDFC Bank', accountNumber: '50100XXXX3456', ifscCode: 'HDFC0003456', branchName: 'Whitefield Branch' }, taxInfo: { panNumber: 'ABCDR5678I', uanNumber: '101123456789', taxRegime: 'new' } },
  { id: 'emp-12', employeeId: 'MRD-1012', firstName: 'Karan', lastName: 'Malhotra', email: 'karan.malhotra@meridian.io', phone: '9876543221', dateOfBirth: '1993-10-05', gender: 'male', address: '23, Hauz Khas', city: 'New Delhi', state: 'Delhi', pincode: '110016', departmentId: 'dept-2', designationId: 'des-7', designation: 'Senior UI/UX Designer', department: 'Product & Design', joiningDate: '2021-11-01', status: 'active', salaryStructureId: 'senior-designer', bankDetails: { bankName: 'ICICI Bank', accountNumber: '00220XXXX5678', ifscCode: 'ICIC0009012', branchName: 'Hauz Khas Branch' }, taxInfo: { panNumber: 'DEFKM9012J', uanNumber: '101234567890', taxRegime: 'old' } },
  { id: 'emp-13', employeeId: 'MRD-1013', firstName: 'Ishita', lastName: 'Verma', email: 'ishita.verma@meridian.io', phone: '9876543222', dateOfBirth: '1995-03-18', gender: 'female', address: '56, Aundh', city: 'Pune', state: 'Maharashtra', pincode: '411007', departmentId: 'dept-2', designationId: 'des-8', designation: 'UI/UX Designer', department: 'Product & Design', joiningDate: '2022-04-15', status: 'active', salaryStructureId: 'designer', bankDetails: { bankName: 'Axis Bank', accountNumber: '12340XXXX9012', ifscCode: 'UTIB0007890', branchName: 'Aundh Branch' }, taxInfo: { panNumber: 'GHIIV3456K', uanNumber: '101345678901', taxRegime: 'new' } },
  { id: 'emp-14', employeeId: 'MRD-1014', firstName: 'Ravi', lastName: 'Kumar', email: 'ravi.kumar@meridian.io', phone: '9876543223', dateOfBirth: '1994-07-22', gender: 'male', address: '78, Jayanagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560041', departmentId: 'dept-2', designationId: 'des-9', designation: 'Product Manager', department: 'Product & Design', joiningDate: '2021-09-01', status: 'active', salaryStructureId: 'manager', bankDetails: { bankName: 'SBI', accountNumber: '31230XXXX9012', ifscCode: 'SBIN0056789', branchName: 'Jayanagar Branch' }, taxInfo: { panNumber: 'JKLRK7890L', uanNumber: '101456789012', taxRegime: 'new' } },
  { id: 'emp-15', employeeId: 'MRD-1015', firstName: 'Tanvi', lastName: 'Desai', email: 'tanvi.desai@meridian.io', phone: '9876543224', dateOfBirth: '1997-11-30', gender: 'female', address: '34, Satellite', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', departmentId: 'dept-2', designationId: 'des-8', designation: 'UI/UX Designer', department: 'Product & Design', joiningDate: '2023-06-01', status: 'active', salaryStructureId: 'designer', bankDetails: { bankName: 'Bank of Baroda', accountNumber: '45670XXXX5678', ifscCode: 'BARB0005678', branchName: 'Satellite Branch' }, taxInfo: { panNumber: 'MNOTD1234M', uanNumber: '101567890123', taxRegime: 'new' } },

  // Sales & Marketing (6)
  { id: 'emp-11', employeeId: 'MRD-1016', firstName: 'Rajesh', lastName: 'Kapoor', email: 'rajesh.kapoor@meridian.io', phone: '9876543225', dateOfBirth: '1987-04-08', gender: 'male', address: '90, Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001', departmentId: 'dept-3', designationId: 'des-10', designation: 'Sales Director', department: 'Sales & Marketing', joiningDate: '2019-11-01', status: 'active', salaryStructureId: 'director', bankDetails: { bankName: 'HDFC Bank', accountNumber: '50100XXXX1234', ifscCode: 'HDFC0001111', branchName: 'CP Branch' }, taxInfo: { panNumber: 'PQRRK5678N', uanNumber: '102123456789', taxRegime: 'old' } },
  { id: 'emp-16', employeeId: 'MRD-1017', firstName: 'Simran', lastName: 'Kaur', email: 'simran.kaur@meridian.io', phone: '9876543226', dateOfBirth: '1991-12-14', gender: 'female', address: '12, Model Town', city: 'Chandigarh', state: 'Punjab', pincode: '160017', departmentId: 'dept-3', designationId: 'des-11', designation: 'Senior Marketing Manager', department: 'Sales & Marketing', joiningDate: '2020-05-15', status: 'active', salaryStructureId: 'senior-manager', bankDetails: { bankName: 'PNB', accountNumber: '23450XXXX6789', ifscCode: 'PUNB0001234', branchName: 'Model Town Branch' }, taxInfo: { panNumber: 'STUSK9012O', uanNumber: '102234567890', taxRegime: 'new' } },
  { id: 'emp-18a', employeeId: 'MRD-1018', firstName: 'Amit', lastName: 'Saxena', email: 'amit.saxena@meridian.io', phone: '9876543227', dateOfBirth: '1993-08-20', gender: 'male', address: '45, Civil Lines', city: 'Jaipur', state: 'Rajasthan', pincode: '302006', departmentId: 'dept-3', designationId: 'des-12', designation: 'Sales Manager', department: 'Sales & Marketing', joiningDate: '2022-02-01', status: 'active', salaryStructureId: 'manager', bankDetails: { bankName: 'ICICI Bank', accountNumber: '00220XXXX1234', ifscCode: 'ICIC0001234', branchName: 'Civil Lines Branch' }, taxInfo: { panNumber: 'VWXAS3456P', uanNumber: '102345678901', taxRegime: 'new' } },
  { id: 'emp-19', employeeId: 'MRD-1019', firstName: 'Pooja', lastName: 'Mishra', email: 'pooja.mishra@meridian.io', phone: '9876543228', dateOfBirth: '1996-02-17', gender: 'female', address: '67, Gomti Nagar', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226010', departmentId: 'dept-3', designationId: 'des-13', designation: 'Marketing Executive', department: 'Sales & Marketing', joiningDate: '2023-04-01', status: 'active', salaryStructureId: 'executive', bankDetails: { bankName: 'Axis Bank', accountNumber: '12340XXXX3456', ifscCode: 'UTIB0001234', branchName: 'Gomti Nagar Branch' }, taxInfo: { panNumber: 'YZAPM7890Q', uanNumber: '102456789012', taxRegime: 'new' } },
  { id: 'emp-20', employeeId: 'MRD-1020', firstName: 'Nikhil', lastName: 'Tiwari', email: 'nikhil.tiwari@meridian.io', phone: '9876543229', dateOfBirth: '1995-06-05', gender: 'male', address: '23, Arera Colony', city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462016', departmentId: 'dept-3', designationId: 'des-14', designation: 'Sales Executive', department: 'Sales & Marketing', joiningDate: '2023-07-15', status: 'active', salaryStructureId: 'executive', bankDetails: { bankName: 'SBI', accountNumber: '31230XXXX1234', ifscCode: 'SBIN0098765', branchName: 'Arera Colony Branch' }, taxInfo: { panNumber: 'BCDNT1234R', uanNumber: '102567890123', taxRegime: 'new' } },
  { id: 'emp-20a', employeeId: 'MRD-1021', firstName: 'Swati', lastName: 'Pandey', email: 'swati.pandey@meridian.io', phone: '9876543230', dateOfBirth: '1998-09-12', gender: 'female', address: '56, Laxmi Nagar', city: 'New Delhi', state: 'Delhi', pincode: '110092', departmentId: 'dept-3', designationId: 'des-15', designation: 'Marketing Associate', department: 'Sales & Marketing', joiningDate: '2024-02-01', status: 'active', salaryStructureId: 'associate', bankDetails: { bankName: 'Kotak Mahindra Bank', accountNumber: '98760XXXX5678', ifscCode: 'KKBK0001234', branchName: 'Laxmi Nagar Branch' }, taxInfo: { panNumber: 'EFGSP5678S', uanNumber: '102678901234', taxRegime: 'new' } },

  // Human Resources (4)
  { id: 'emp-17', employeeId: 'MRD-1022', firstName: 'Sunita', lastName: 'Agarwal', email: 'sunita.agarwal@meridian.io', phone: '9876543231', dateOfBirth: '1989-05-25', gender: 'female', address: '78, Salt Lake', city: 'Kolkata', state: 'West Bengal', pincode: '700091', departmentId: 'dept-4', designationId: 'des-16', designation: 'HR Director', department: 'Human Resources', joiningDate: '2019-06-01', status: 'active', salaryStructureId: 'director', bankDetails: { bankName: 'HDFC Bank', accountNumber: '50100XXXX5678', ifscCode: 'HDFC0005678', branchName: 'Salt Lake Branch' }, taxInfo: { panNumber: 'HIJSA9012T', uanNumber: '103123456789', taxRegime: 'old' } },
  { id: 'emp-22', employeeId: 'MRD-1023', firstName: 'Gaurav', lastName: 'Bhatt', email: 'gaurav.bhatt@meridian.io', phone: '9876543232', dateOfBirth: '1992-11-18', gender: 'male', address: '34, Rajpur Road', city: 'Dehradun', state: 'Uttarakhand', pincode: '248001', departmentId: 'dept-4', designationId: 'des-17', designation: 'HR Manager', department: 'Human Resources', joiningDate: '2021-03-15', status: 'active', salaryStructureId: 'manager', bankDetails: { bankName: 'PNB', accountNumber: '23450XXXX1234', ifscCode: 'PUNB0005678', branchName: 'Rajpur Road Branch' }, taxInfo: { panNumber: 'KLMGB3456U', uanNumber: '103234567890', taxRegime: 'new' } },
  { id: 'emp-23', employeeId: 'MRD-1024', firstName: 'Nisha', lastName: 'Chauhan', email: 'nisha.chauhan@meridian.io', phone: '9876543233', dateOfBirth: '1996-03-07', gender: 'female', address: '90, Vaishali Nagar', city: 'Jaipur', state: 'Rajasthan', pincode: '302021', departmentId: 'dept-4', designationId: 'des-18', designation: 'HR Executive', department: 'Human Resources', joiningDate: '2023-01-10', status: 'active', salaryStructureId: 'executive', bankDetails: { bankName: 'ICICI Bank', accountNumber: '00220XXXX3456', ifscCode: 'ICIC0003456', branchName: 'Vaishali Nagar Branch' }, taxInfo: { panNumber: 'NOPNC7890V', uanNumber: '103345678901', taxRegime: 'new' } },
  { id: 'emp-23a', employeeId: 'MRD-1025', firstName: 'Abhishek', lastName: 'Das', email: 'abhishek.das@meridian.io', phone: '9876543234', dateOfBirth: '1997-07-30', gender: 'male', address: '12, Park Street', city: 'Kolkata', state: 'West Bengal', pincode: '700016', departmentId: 'dept-4', designationId: 'des-19', designation: 'HR Associate', department: 'Human Resources', joiningDate: '2024-04-01', status: 'active', salaryStructureId: 'associate' },

  // Finance & Accounts (3)
  { id: 'emp-21', employeeId: 'MRD-1026', firstName: 'Manoj', lastName: 'Srivastava', email: 'manoj.srivastava@meridian.io', phone: '9876543235', dateOfBirth: '1986-10-12', gender: 'male', address: '45, Residency Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560025', departmentId: 'dept-5', designationId: 'des-20', designation: 'Finance Director', department: 'Finance & Accounts', joiningDate: '2019-03-01', status: 'active', salaryStructureId: 'director', bankDetails: { bankName: 'SBI', accountNumber: '31230XXXX3456', ifscCode: 'SBIN0011111', branchName: 'Residency Road Branch' }, taxInfo: { panNumber: 'QRSMS1234W', uanNumber: '104123456789', taxRegime: 'old' } },
  { id: 'emp-25', employeeId: 'MRD-1027', firstName: 'Rekha', lastName: 'Pillai', email: 'rekha.pillai@meridian.io', phone: '9876543236', dateOfBirth: '1993-01-28', gender: 'female', address: '67, Thiruvananthapuram Road', city: 'Thiruvananthapuram', state: 'Kerala', pincode: '695001', departmentId: 'dept-5', designationId: 'des-21', designation: 'Senior Accountant', department: 'Finance & Accounts', joiningDate: '2021-06-15', status: 'active', salaryStructureId: 'senior-engineer', bankDetails: { bankName: 'Federal Bank', accountNumber: '67890XXXX5678', ifscCode: 'FDRL0005678', branchName: 'TVM Main Branch' }, taxInfo: { panNumber: 'TUVRP5678X', uanNumber: '104234567890', taxRegime: 'new' } },
  { id: 'emp-26', employeeId: 'MRD-1028', firstName: 'Suresh', lastName: 'Menon', email: 'suresh.menon@meridian.io', phone: '9876543237', dateOfBirth: '1994-05-15', gender: 'male', address: '23, Panaji Road', city: 'Panaji', state: 'Goa', pincode: '403001', departmentId: 'dept-5', designationId: 'des-22', designation: 'Accounts Executive', department: 'Finance & Accounts', joiningDate: '2023-02-01', status: 'active', salaryStructureId: 'executive', bankDetails: { bankName: 'Axis Bank', accountNumber: '12340XXXX7890', ifscCode: 'UTIB0009012', branchName: 'Panaji Branch' }, taxInfo: { panNumber: 'WXYSM9012Y', uanNumber: '104345678901', taxRegime: 'new' } },

  // Operations (2)
  { id: 'emp-24', employeeId: 'MRD-1029', firstName: 'Vivek', lastName: 'Choudhary', email: 'vivek.choudhary@meridian.io', phone: '9876543238', dateOfBirth: '1988-09-20', gender: 'male', address: '56, MG Road', city: 'Indore', state: 'Madhya Pradesh', pincode: '452001', departmentId: 'dept-6', designationId: 'des-23', designation: 'Operations Manager', department: 'Operations', joiningDate: '2020-10-01', status: 'active', salaryStructureId: 'manager', bankDetails: { bankName: 'HDFC Bank', accountNumber: '50100XXXX9012', ifscCode: 'HDFC0009012', branchName: 'MG Road Indore Branch' }, taxInfo: { panNumber: 'ZABVC3456Z', uanNumber: '105123456789', taxRegime: 'new' } },
  { id: 'emp-27', employeeId: 'MRD-1030', firstName: 'Anjali', lastName: 'Bose', email: 'anjali.bose@meridian.io', phone: '9876543239', dateOfBirth: '1995-12-08', gender: 'female', address: '78, New Town', city: 'Kolkata', state: 'West Bengal', pincode: '700156', departmentId: 'dept-6', designationId: 'des-24', designation: 'Operations Executive', department: 'Operations', joiningDate: '2023-09-01', status: 'active', salaryStructureId: 'executive', bankDetails: { bankName: 'ICICI Bank', accountNumber: '00220XXXX7890', ifscCode: 'ICIC0007890', branchName: 'New Town Branch' }, taxInfo: { panNumber: 'CDEAB7890A', uanNumber: '105234567890', taxRegime: 'new' } },
];

// Attach salary structures to employees
employees.forEach(emp => {
  if (emp.salaryStructureId && salaryStructures[emp.salaryStructureId]) {
    emp.salaryStructure = salaryStructures[emp.salaryStructureId];
  }
});

// ─── Attendance Summaries ────────────────────────────────────────────────────
function generateAttendanceSummary(employeeId: string, month: number, year: number): AttendanceSummary {
  const totalDays = new Date(year, month, 0).getDate();
  // Count weekends
  let weekends = 0;
  for (let d = 1; d <= totalDays; d++) {
    const day = new Date(year, month - 1, d).getDay();
    if (day === 0 || day === 6) weekends++;
  }
  const holidays = month === 8 ? 2 : month === 10 ? 3 : 1; // More holidays in Aug and Oct
  const workingDays = totalDays - weekends - holidays;

  // Randomize attendance
  const seed = employeeId.charCodeAt(4) + month;
  const absentDays = seed % 3;
  const halfDays = seed % 2;
  const leaveDays = (seed + 1) % 3;
  const wfhDays = Math.min((seed + 2) % 5, 4);
  const presentDays = workingDays - absentDays - halfDays - leaveDays;
  const lossOfPayDays = Math.max(0, absentDays - 1); // 1 absent day may be compensated

  return {
    employeeId, month: `${year}-${String(month).padStart(2, '0')}`, year,
    totalDays, workingDays, presentDays, absentDays, halfDays,
    leaveDays, holidays, weekends, wfhDays, lossOfPayDays
  };
}

export const attendanceSummaries: AttendanceSummary[] = employees.flatMap(emp =>
  [
    generateAttendanceSummary(emp.id, 7, 2026),  // July
    generateAttendanceSummary(emp.id, 8, 2026),  // August
    generateAttendanceSummary(emp.id, 9, 2026),  // September
    generateAttendanceSummary(emp.id, 10, 2026), // October (current)
  ]
);

// ─── Leave Balances ──────────────────────────────────────────────────────────
export const leaveBalances: LeaveBalance[] = employees.map(emp => {
  const seed = emp.id.charCodeAt(4);
  return [
    { employeeId: emp.id, leaveType: 'casual' as const, total: 12, used: (seed % 5) + 1, remaining: 12 - ((seed % 5) + 1), carryForward: 0 },
    { employeeId: emp.id, leaveType: 'sick' as const, total: 10, used: seed % 3, remaining: 10 - (seed % 3), carryForward: 0 },
    { employeeId: emp.id, leaveType: 'earned' as const, total: 15, used: (seed % 4) + 1, remaining: 15 - ((seed % 4) + 1), carryForward: 2 },
  ];
}).flat();

// ─── Leave Requests ──────────────────────────────────────────────────────────
export const leaveRequests: LeaveRequest[] = [
  { id: 'lr-1', employeeId: 'emp-3', leaveType: 'casual', startDate: '2026-10-28', endDate: '2026-10-29', days: 2, reason: 'Personal work', status: 'approved', appliedOn: '2026-10-25', approvedBy: 'emp-1' },
  { id: 'lr-2', employeeId: 'emp-7', leaveType: 'sick', startDate: '2026-10-15', endDate: '2026-10-16', days: 2, reason: 'Unwell', status: 'approved', appliedOn: '2026-10-14', approvedBy: 'emp-1' },
  { id: 'lr-3', employeeId: 'emp-19', leaveType: 'casual', startDate: '2026-11-03', endDate: '2026-11-04', days: 2, reason: 'Family event', status: 'pending', appliedOn: '2026-10-30' },
  { id: 'lr-4', employeeId: 'emp-13', leaveType: 'earned', startDate: '2026-11-10', endDate: '2026-11-14', days: 5, reason: 'Vacation', status: 'pending', appliedOn: '2026-10-29' },
];

// ─── Payroll Runs ────────────────────────────────────────────────────────────
function generatePayrollItems(month: number, year: number, status: PayrollItem['status']): PayrollItem[] {
  return employees.filter(e => e.status === 'active' || e.status === 'probation').map(emp => {
    const ss = emp.salaryStructure;
    if (!ss) return null;

    const att = attendanceSummaries.find(a => a.employeeId === emp.id && a.month === `${year}-${String(month).padStart(2, '0')}`);
    const lopDays = att?.lossOfPayDays ?? 0;
    const workingDays = att?.workingDays ?? 22;
    const presentDays = att?.presentDays ?? workingDays;

    const basic = ss.components.find(c => c.category === 'basic')?.value ?? 0;
    const hra = ss.components.find(c => c.category === 'hra');
    const hraAmount = hra ? (hra.calculationType === 'percentage_of_basic' ? Math.round(basic * hra.value / 100) : hra.value) : 0;
    const conv = ss.components.find(c => c.category === 'conveyance')?.value ?? 0;
    const special = ss.components.find(c => c.category === 'special');
    const specialAmount = special ? (special.calculationType === 'percentage_of_basic' ? Math.round(basic * special.value / 100) : special.value) : 0;

    const grossBeforeLOP = basic + hraAmount + conv + specialAmount;
    const dailyRate = Math.round(grossBeforeLOP / workingDays);
    const lopDeduction = dailyRate * lopDays;
    const grossSalary = grossBeforeLOP - lopDeduction;

    const pfDeduction = Math.min(Math.round(basic * 0.12), 1800);
    const professionalTax = grossBeforeLOP > 25000 ? 200 : grossBeforeLOP > 15000 ? 150 : 0;
    const annualGross = grossBeforeLOP * 12;
    const tds = annualGross > 1000000 ? Math.round((annualGross * 0.20) / 12) :
                annualGross > 750000 ? Math.round((annualGross * 0.15) / 12) :
                annualGross > 500000 ? Math.round((annualGross * 0.10) / 12) :
                annualGross > 300000 ? Math.round((annualGross * 0.05) / 12) : 0;
    const esiDeduction = grossBeforeLOP <= 21000 ? Math.round(grossBeforeLOP * 0.0075) : 0;

    const totalDeductions = pfDeduction + professionalTax + tds + esiDeduction;
    const netSalary = grossSalary - totalDeductions;

    const hasException = emp.id === 'emp-9' || emp.id === 'emp-23a' || emp.id === 'emp-10';

    return {
      id: `pi-${emp.id}-${month}-${year}`,
      payrollRunId: `pr-${month}-${year}`,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeCode: emp.employeeId,
      department: emp.department,
      designation: emp.designation,
      basicSalary: basic,
      hra: hraAmount,
      conveyance: conv,
      specialAllowance: specialAmount,
      otherEarnings: 0,
      bonus: 0,
      overtime: 0,
      grossSalary,
      pfDeduction,
      professionalTax,
      tds,
      esiDeduction,
      otherDeductions: 0,
      totalDeductions,
      netSalary,
      lossOfPayDays: lopDays,
      lopDeduction,
      workingDays,
      presentDays,
      status,
      hasException,
      exceptionNote: hasException ? (emp.id === 'emp-9' ? 'Missing bank details' : emp.id === 'emp-23a' ? 'Missing bank details' : 'Intern – confirm salary structure') : undefined,
    } as PayrollItem;
  }).filter(Boolean) as PayrollItem[];
}

const octItems = generatePayrollItems(10, 2026, 'calculated');
const sepItems = generatePayrollItems(9, 2026, 'approved');
const augItems = generatePayrollItems(8, 2026, 'approved');
const julItems = generatePayrollItems(7, 2026, 'approved');

function sumItems(items: PayrollItem[]) {
  return {
    totalGross: items.reduce((s, i) => s + i.grossSalary, 0),
    totalDeductions: items.reduce((s, i) => s + i.totalDeductions, 0),
    totalNet: items.reduce((s, i) => s + i.netSalary, 0),
  };
}

export const payrollRuns: PayrollRun[] = [
  {
    id: 'pr-10-2026', month: 10, year: 2026, status: 'review', stage: 'hr_review',
    totalEmployees: octItems.length, ...sumItems(octItems),
    exceptionsCount: octItems.filter(i => i.hasException).length,
    readinessScore: 92,
    createdAt: '2026-10-28T10:00:00Z',
    items: octItems,
  },
  {
    id: 'pr-9-2026', month: 9, year: 2026, status: 'processed', stage: 'processed',
    totalEmployees: sepItems.length, ...sumItems(sepItems),
    exceptionsCount: 0, readinessScore: 100,
    createdAt: '2026-09-25T10:00:00Z', processedAt: '2026-09-30T14:00:00Z',
    approvedBy: 'Manoj Srivastava', approvedAt: '2026-09-29T16:00:00Z',
    items: sepItems,
  },
  {
    id: 'pr-8-2026', month: 8, year: 2026, status: 'processed', stage: 'processed',
    totalEmployees: augItems.length, ...sumItems(augItems),
    exceptionsCount: 0, readinessScore: 100,
    createdAt: '2026-08-25T10:00:00Z', processedAt: '2026-08-31T14:00:00Z',
    approvedBy: 'Manoj Srivastava', approvedAt: '2026-08-30T16:00:00Z',
    items: augItems,
  },
  {
    id: 'pr-7-2026', month: 7, year: 2026, status: 'processed', stage: 'processed',
    totalEmployees: julItems.length, ...sumItems(julItems),
    exceptionsCount: 0, readinessScore: 100,
    createdAt: '2026-07-25T10:00:00Z', processedAt: '2026-07-31T14:00:00Z',
    approvedBy: 'Manoj Srivastava', approvedAt: '2026-07-30T16:00:00Z',
    items: julItems,
  },
];

// ─── Payroll Exceptions ──────────────────────────────────────────────────────
export const payrollExceptions: PayrollException[] = [
  { id: 'pe-1', payrollRunId: 'pr-10-2026', employeeId: 'emp-9', employeeName: 'Aditya Singh', type: 'missing_bank_details', severity: 'high', description: 'Bank account details not provided. Cannot process salary transfer.', recommendation: 'Request employee to submit bank details immediately.', resolved: false },
  { id: 'pe-2', payrollRunId: 'pr-10-2026', employeeId: 'emp-23a', employeeName: 'Abhishek Das', type: 'missing_bank_details', severity: 'high', description: 'Bank account details not provided. Cannot process salary transfer.', recommendation: 'Request employee to submit bank details immediately.', resolved: false },
  { id: 'pe-3', payrollRunId: 'pr-10-2026', employeeId: 'emp-10', employeeName: 'Meera Iyer', type: 'new_joinee', severity: 'medium', description: 'New joinee (intern) – salary structure needs confirmation for first full payroll.', recommendation: 'Verify intern salary structure and confirm with HR lead.', resolved: false },
  { id: 'pe-4', payrollRunId: 'pr-10-2026', employeeId: 'emp-9', employeeName: 'Aditya Singh', type: 'pending_salary_revision', severity: 'low', description: 'Probation period ending. Salary revision may be pending.', recommendation: 'Check with manager for probation review and salary update.', resolved: false },
];

// ─── Payroll Activities ──────────────────────────────────────────────────────
export const payrollActivities: PayrollActivity[] = [
  { id: 'pa-1', type: 'payroll_processed', description: 'September 2026 payroll processed successfully', timestamp: '2026-09-30T14:00:00Z', user: 'Sunita Agarwal' },
  { id: 'pa-2', type: 'payroll_approved', description: 'September 2026 payroll approved by Finance', timestamp: '2026-09-29T16:00:00Z', user: 'Manoj Srivastava' },
  { id: 'pa-3', type: 'salary_revised', description: 'Salary revised for Rohit Patel – effective October 2026', timestamp: '2026-10-05T11:30:00Z', user: 'Sunita Agarwal' },
  { id: 'pa-4', type: 'employee_added', description: 'New employee Meera Iyer joined as Engineering Intern', timestamp: '2026-09-01T09:00:00Z', user: 'Gaurav Bhatt' },
  { id: 'pa-5', type: 'exception_resolved', description: 'Missing bank details resolved for Kavitha Nair', timestamp: '2026-09-28T15:00:00Z', user: 'Nisha Chauhan' },
  { id: 'pa-6', type: 'leave_approved', description: 'Casual leave approved for Vikram Reddy (Oct 28-29)', timestamp: '2026-10-26T10:00:00Z', user: 'Arjun Mehta' },
  { id: 'pa-7', type: 'payroll_processed', description: 'October 2026 payroll calculation initiated', timestamp: '2026-10-28T10:00:00Z', user: 'Sunita Agarwal' },
];

// ─── Announcements ───────────────────────────────────────────────────────────
export const announcements: Announcement[] = [
  { id: 'ann-1', title: 'Diwali Bonus Disbursement', content: 'Diwali bonus will be included in the November payroll. HR will share individual amounts by Nov 5.', type: 'info', createdAt: '2026-10-25T09:00:00Z', expiresAt: '2026-11-15T00:00:00Z', createdBy: 'Sunita Agarwal' },
  { id: 'ann-2', title: 'Tax Declaration Deadline', content: 'Please submit your investment proofs and tax declarations by November 30 for accurate TDS calculation in December payroll.', type: 'warning', createdAt: '2026-10-20T09:00:00Z', expiresAt: '2026-11-30T00:00:00Z', createdBy: 'Manoj Srivastava' },
  { id: 'ann-3', title: 'Office Closed – Diwali', content: 'The office will remain closed from November 1 to November 3 for Diwali celebrations. Wishing everyone a happy and prosperous Diwali!', type: 'info', createdAt: '2026-10-28T09:00:00Z', expiresAt: '2026-11-04T00:00:00Z', createdBy: 'Sunita Agarwal' },
];

// ─── Readiness Data ──────────────────────────────────────────────────────────
export const readinessItems: ReadinessItem[] = [
  {
    category: 'Bank Details', label: 'Missing Bank Details', description: 'Employees without bank account details cannot receive salary.',
    count: 2, employees: [
      { id: 'emp-9', name: 'Aditya Singh', issue: 'No bank account on file' },
      { id: 'emp-23a', name: 'Abhishek Das', issue: 'No bank account on file' },
    ], icon: 'Building2', severity: 'high',
  },
  {
    category: 'Salary Structure', label: 'Pending Salary Confirmation', description: 'New employees needing salary structure confirmation.',
    count: 1, employees: [
      { id: 'emp-10', name: 'Meera Iyer', issue: 'Intern – salary structure requires confirmation' },
    ], icon: 'IndianRupee', severity: 'medium',
  },
  {
    category: 'Attendance', label: 'Incomplete Attendance', description: 'Employees with attendance gaps this month.',
    count: 0, employees: [], icon: 'CalendarCheck', severity: 'low',
  },
  {
    category: 'Tax Info', label: 'Tax Declarations Pending', description: 'Employees who have not submitted tax declarations.',
    count: 1, employees: [
      { id: 'emp-9', name: 'Aditya Singh', issue: 'Tax regime not declared' },
    ], icon: 'FileText', severity: 'medium',
  },
];

// ─── Demo Users ──────────────────────────────────────────────────────────────
export const demoUsers: DemoUser[] = [
  { id: 'user-1', name: 'Sunita Agarwal', email: 'hr@meridian.io', role: 'hr_admin', employeeId: 'emp-17' },
  { id: 'user-2', name: 'Priya Sharma', email: 'priya@meridian.io', role: 'employee', employeeId: 'emp-2' },
];

// ─── Months helper ───────────────────────────────────────────────────────────
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ─── Payslip generator ──────────────────────────────────────────────────────
export function generatePayslip(item: PayrollItem, run: PayrollRun): Payslip {
  const emp = employees.find(e => e.id === item.employeeId)!;
  const grossBeforeLOP = item.basicSalary + item.hra + item.conveyance + item.specialAllowance + item.otherEarnings + item.bonus + item.overtime;
  const totalDeductionsWithLOP = item.totalDeductions + item.lopDeduction;

  return {
    id: `ps-${item.id}`,
    employeeId: item.employeeId,
    payrollRunId: run.id,
    month: run.month,
    year: run.year,
    employee: {
      name: item.employeeName,
      employeeId: item.employeeCode,
      designation: item.designation,
      department: item.department,
      dateOfJoining: emp?.joiningDate ?? '',
      bankName: emp?.bankDetails?.bankName ?? '—',
      accountNumber: emp?.bankDetails?.accountNumber ?? '—',
      panNumber: emp?.taxInfo?.panNumber ?? '—',
      uanNumber: emp?.taxInfo?.uanNumber ?? '—',
    },
    earnings: [
      { name: 'Basic Salary', amount: item.basicSalary },
      { name: 'House Rent Allowance', amount: item.hra },
      { name: 'Conveyance Allowance', amount: item.conveyance },
      { name: 'Special Allowance', amount: item.specialAllowance },
      ...(item.bonus > 0 ? [{ name: 'Bonus', amount: item.bonus }] : []),
      ...(item.overtime > 0 ? [{ name: 'Overtime', amount: item.overtime }] : []),
      ...(item.otherEarnings > 0 ? [{ name: 'Other Earnings', amount: item.otherEarnings }] : []),
    ],
    deductions: [
      { name: 'Employee PF', amount: item.pfDeduction },
      { name: 'Professional Tax', amount: item.professionalTax },
      ...(item.tds > 0 ? [{ name: 'Tax Deducted at Source', amount: item.tds }] : []),
      ...(item.esiDeduction > 0 ? [{ name: 'ESI', amount: item.esiDeduction }] : []),
      ...(item.lopDeduction > 0 ? [{ name: 'Loss of Pay', amount: item.lopDeduction }] : []),
      ...(item.otherDeductions > 0 ? [{ name: 'Other Deductions', amount: item.otherDeductions }] : []),
    ],
    grossSalary: grossBeforeLOP,
    totalDeductions: totalDeductionsWithLOP,
    netSalary: item.netSalary,
    paidDays: item.presentDays,
    lopDays: item.lossOfPayDays,
    totalDays: item.workingDays,
    paymentStatus: run.status === 'processed' ? 'paid' : 'pending',
    paymentDate: run.processedAt,
    paymentMode: 'Bank Transfer',
  };
}

