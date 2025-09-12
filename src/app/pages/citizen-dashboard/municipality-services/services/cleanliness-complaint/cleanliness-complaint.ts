// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { Router, RouterLink } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { ServiceRequestService } from '../../../../../services/service-request.service';
// import { AuthService } from '../../../../../services/auth.service';
// import { User } from '../../../../../interfaces/user.interface';
//
// interface Attachment {
//   id: string;
//   name: string;
//   description: string;
//   allowedTypes: string[];
//   file: File | null;
// }
//
// @Component({
//   selector: 'app-cleanliness-complaint',
//   standalone: true,
//   imports: [ CommonModule, ReactiveFormsModule, RouterLink ],
//   templateUrl: './cleanliness-complaint.html',
//   styleUrls: ['./cleanliness-complaint.css']
// })
// export class CleanlinessComplaintComponent implements OnInit {
//   complaintForm: FormGroup;
//   isLoading = false;
//   userData: User | null = null;
//   isAlertVisible = false;
//   alertTitle = '';
//   alertMessage = '';
//   alertType: 'success' | 'error' = 'success';
//   totalFileSize: number = 0;
//   maxTotalFileSize: number = 50 * 1024 * 1024;
//   serviceInfo = {
//     title: 'Cleanliness Complaint',
//     department: 'Local Municipality',
//     description: 'Report issues related to public cleanliness in streets and residential areas.',
//     processingTime: 'Estimated response time: Within 24-48 business hours.'
//   };
//   attachments: Attachment[] = [
//     { id: 'problemImage', name: 'Photo of the Issue', description: 'JPG, PNG, PDF', allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'], file: null },
//     { id: 'supportingDocs', name: 'Supporting Documents (if any)', description: 'PDF', allowedTypes: ['application/pdf'], file: null }
//   ];
//   governorates = ['Cairo', 'Giza'];
//   complaintTypes = [
//     'Garbage Accumulation',
//     'Full or Broken Container',
//     'Sanitation Workers Not Attending',
//     'Construction or Demolition Debris',
//     'Hazardous Waste',
//     'Other'
//   ];
//
//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private serviceRequestService: ServiceRequestService,
//     private authService: AuthService
//   ) {
//     this.complaintForm = this.fb.group({
//       fullName: [{ value: '', disabled: true }, Validators.required],
//       nationalId: [{ value: '', disabled: true }, Validators.required],
//       mobileNumber: [{ value: '', disabled: true }, Validators.required],
//       email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
//       governorate: ['', Validators.required],
//       city: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\u0621-\u064A\s]+$/)]],
//       address: ['', Validators.required],
//       complaintType: ['', Validators.required],
//       // ✅ START: تم تحديث قواعد التحقق
//       description: ['', [Validators.required, Validators.minLength(100), Validators.maxLength(1000)]],
//       // ✅ END: نهاية التحديث
//     });
//   }
//
//   ngOnInit(): void {
//     this.loadUserData();
//   }
//
//   loadUserData(): void {
//     const currentUser = this.authService.currentUser();
//     if (currentUser) {
//       this.userData = currentUser;
//       this.complaintForm.patchValue({
//         fullName: currentUser.fullName,
//         nationalId: currentUser.nationalId,
//         email: currentUser.email,
//         mobileNumber: currentUser.phoneNumber
//       });
//     }
//   }
//
//   submitRequest(): void {
//     this.markFormGroupTouched();
//     if (this.complaintForm.invalid) {
//       this.showAlert('Incomplete Data', 'Please fill in all required fields correctly.', 'error');
//       return;
//     }
//     this.isLoading = true;
//     const formData = new FormData();
//     const formDetails = this.complaintForm.getRawValue();
//     const requestPayload = {
//       serviceName: this.serviceInfo.title,
//       department: 'Local Municipality',
//       details: JSON.stringify(formDetails)
//     };
//     formData.append('request', JSON.stringify(requestPayload));
//     this.attachments.forEach(doc => {
//       if (doc.file) {
//         formData.append('files', doc.file, doc.file.name);
//       }
//     });
//     this.serviceRequestService.createRequest(formData).subscribe({
//       next: (response: any) => {
//         this.isLoading = false;
//         const complaintId = response.id;
//         this.showAlert('Success', `Your complaint has been successfully registered. Your tracking number is: ${complaintId}`, 'success');
//         setTimeout(() => {
//           this.hideAlert();
//           this.router.navigate(['/citizen-dashboard']);
//         }, 4000);
//       },
//       error: (error: any) => {
//         this.isLoading = false;
//         console.error('Error submitting complaint:', error);
//         this.showAlert('Submission Failed', 'An error occurred while submitting the complaint. Please try again.', 'error');
//       }
//     });
//   }
//
//   showAlert(title: string, message: string, type: 'success' | 'error' = 'success'): void {
//     this.alertTitle = title;
//     this.alertMessage = message;
//     this.alertType = type;
//     this.isAlertVisible = true;
//   }
//
//   hideAlert(): void {
//     this.isAlertVisible = false;
//   }
//
//   onFileSelected(event: any, index: number): void {
//     const file = event.target.files?.[0];
//     if (!file) return;
//     const attachmentRequirement = this.attachments[index];
//     const oldFileSize = attachmentRequirement.file ? attachmentRequirement.file.size : 0;
//     if (this.totalFileSize - oldFileSize + file.size > this.maxTotalFileSize) {
//       const maxSizeInMB = this.maxTotalFileSize / (1024 * 1024);
//       this.showAlert('File Size Limit Exceeded', `The total size of all attachments cannot exceed ${maxSizeInMB} MB.`, 'error');
//       event.target.value = null;
//       return;
//     }
//     if (attachmentRequirement.allowedTypes.includes(file.type)) {
//       this.totalFileSize = this.totalFileSize - oldFileSize + file.size;
//       attachmentRequirement.file = file;
//     } else {
//       this.showAlert('Invalid File Type', `File format not allowed. Allowed formats: ${attachmentRequirement.description}`, 'error');
//     }
//     event.target.value = null;
//   }
//
//   removeFile(index: number): void {
//     const attachmentRequirement = this.attachments[index];
//     if (attachmentRequirement.file) {
//       this.totalFileSize -= attachmentRequirement.file.size;
//       attachmentRequirement.file = null;
//     }
//   }
//
//   markFormGroupTouched(): void {
//     Object.values(this.complaintForm.controls).forEach(control => {
//       control.markAsTouched();
//     });
//   }
//
//   cancel(): void {
//     this.router.navigate(['/municipality-services']);
//   }
// }






import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ServiceRequestService } from '../../../../../services/service-request.service';
import { AuthService } from '../../../../../services/auth.service';
import { User } from '../../../../../interfaces/user.interface';

interface Attachment {
  id: string;
  name: string;
  description: string;
  allowedTypes: string[];
  file: File | null;
}

@Component({
  selector: 'app-cleanliness-complaint',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterLink ],
  templateUrl: './cleanliness-complaint.html',
  styleUrls: ['./cleanliness-complaint.css']
})
export class CleanlinessComplaintComponent implements OnInit {
  complaintForm: FormGroup;
  isLoading = false;
  userData: User | null = null;
  isAlertVisible = false;
  alertTitle = '';
  alertMessage = '';
  alertType: 'success' | 'error' = 'success';
  totalFileSize: number = 0;
  maxTotalFileSize: number = 50 * 1024 * 1024;
  serviceInfo = {
    title: 'Cleanliness Complaint',
    department: 'Local Municipality',
    description: 'Report issues related to public cleanliness in streets and residential areas.',
    processingTime: 'Estimated response time: Within 24-48 business hours.'
  };
  attachments: Attachment[] = [
    { id: 'problemImage', name: 'Photo of the Issue', description: 'JPG, PNG, PDF', allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'], file: null },
    { id: 'supportingDocs', name: 'Supporting Documents (if any)', description: 'PDF', allowedTypes: ['application/pdf'], file: null }
  ];
  governorates = ['Cairo', 'Giza'];
  complaintTypes = [
    'Garbage Accumulation',
    'Full or Broken Container',
    'Sanitation Workers Not Attending',
    'Construction or Demolition Debris',
    'Hazardous Waste',
    'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private serviceRequestService: ServiceRequestService,
    private authService: AuthService
  ) {
    this.complaintForm = this.fb.group({
      fullName: [{ value: '', disabled: true }, Validators.required],
      nationalId: [{ value: '', disabled: true }, Validators.required],
      mobileNumber: [{ value: '', disabled: true }, Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      governorate: ['', Validators.required],
      city: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\u0621-\u064A\s]+$/)]],
      address: ['', Validators.required],
      complaintType: ['', Validators.required],
      // ✅ START: تم تحديث قواعد التحقق
      description: ['', [Validators.required, Validators.minLength(100), Validators.maxLength(1000)]],
      // ✅ END: نهاية التحديث
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.userData = currentUser;
      this.complaintForm.patchValue({
        fullName: currentUser.fullName,
        nationalId: currentUser.nationalId,
        email: currentUser.email,
        mobileNumber: currentUser.phoneNumber
      });
    }
  }

  submitRequest(): void {
    this.markFormGroupTouched();
    if (this.complaintForm.invalid) {
      this.showAlert('Incomplete Data', 'Please fill in all required fields correctly.', 'error');
      return;
    }
    this.isLoading = true;
    const formData = new FormData();
    const formDetails = this.complaintForm.getRawValue();
    const requestPayload = {
      serviceName: this.serviceInfo.title,
      department: 'Local Municipality',
      details: JSON.stringify(formDetails)
    };
    formData.append('request', JSON.stringify(requestPayload));
    this.attachments.forEach(doc => {
      if (doc.file) {
        formData.append('files', doc.file, doc.file.name);
      }
    });
    this.serviceRequestService.createRequest(formData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        const complaintId = response.id;
        this.showAlert('Success', `Your complaint has been successfully registered. Your tracking number is: ${complaintId}`, 'success');
        setTimeout(() => {
          this.hideAlert();
          this.router.navigate(['/citizen-dashboard']);
        }, 4000);
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error submitting complaint:', error);
        this.showAlert('Submission Failed', 'An error occurred while submitting the complaint. Please try again.', 'error');
      }
    });
  }

  showAlert(title: string, message: string, type: 'success' | 'error' = 'success'): void {
    this.alertTitle = title;
    this.alertMessage = message;
    this.alertType = type;
    this.isAlertVisible = true;
  }

  hideAlert(): void {
    this.isAlertVisible = false;
  }

  onFileSelected(event: any, index: number): void {
    const file = event.target.files?.[0];
    if (!file) return;
    const attachmentRequirement = this.attachments[index];
    const oldFileSize = attachmentRequirement.file ? attachmentRequirement.file.size : 0;
    if (this.totalFileSize - oldFileSize + file.size > this.maxTotalFileSize) {
      const maxSizeInMB = this.maxTotalFileSize / (1024 * 1024);
      this.showAlert('File Size Limit Exceeded', `The total size of all attachments cannot exceed ${maxSizeInMB} MB.`, 'error');
      event.target.value = null;
      return;
    }
    if (attachmentRequirement.allowedTypes.includes(file.type)) {
      this.totalFileSize = this.totalFileSize - oldFileSize + file.size;
      attachmentRequirement.file = file;
    } else {
      this.showAlert('Invalid File Type', `File format not allowed. Allowed formats: ${attachmentRequirement.description}`, 'error');
    }
    event.target.value = null;
  }

  removeFile(index: number): void {
    const attachmentRequirement = this.attachments[index];
    if (attachmentRequirement.file) {
      this.totalFileSize -= attachmentRequirement.file.size;
      attachmentRequirement.file = null;
    }
  }

  markFormGroupTouched(): void {
    Object.values(this.complaintForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  cancel(): void {
    this.router.navigate(['/municipality-services']);
  }
}
