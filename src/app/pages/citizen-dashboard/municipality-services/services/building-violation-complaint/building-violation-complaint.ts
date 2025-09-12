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
//   selector: 'app-building-violation-complaint',
//   standalone: true,
//   imports: [ CommonModule, ReactiveFormsModule, RouterLink ],
//   templateUrl: './building-violation-complaint.html',
//   styleUrls: ['./building-violation-complaint.css']
// })
// export class BuildingViolationComplaintComponent implements OnInit {
//   complaintForm: FormGroup;
//   isLoading = false;
//   userData: User | null = null;
//   isAlertVisible = false;
//   alertTitle = '';
//   alertMessage = '';
//   alertType: 'success' | 'error' = 'success';
//   totalFileSize: number = 0;
//   maxTotalFileSize: number = 100 * 1024 * 1024;
//   serviceInfo = {
//     title: 'Building Violation Complaint',
//     department: 'Local Municipality',
//     description: 'Report any building violations to the concerned authorities. Evidence is crucial for investigation.',
//     processingTime: 'Response and action time depends on the violation\'s severity.'
//   };
//   attachments: Attachment[] = [
//     { id: 'violationPhoto', name: 'Photo/Video of Violation', description: 'JPG, PNG, MP4, PDF', allowedTypes: ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'], file: null },
//     { id: 'supportingDocs', name: 'Supporting Documents (if any)', description: 'PDF', allowedTypes: ['application/pdf'], file: null }
//   ];
//   governorates = ['Cairo', 'Giza'];
//   violationTypes = [
//     'Building without a license',
//     'Exceeding height/floor limits',
//     'Encroachment on street/neighboring property',
//     'Changing property usage (e.g., residential to commercial)',
//     'Unsafe demolition or modification works',
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
//       isAnonymous: [false],
//       fullName: [{ value: '', disabled: true }],
//       nationalId: [{ value: '', disabled: true }],
//       mobileNumber: [{ value: '', disabled: true }],
//       email: [{ value: '', disabled: true }],
//       governorate: ['', Validators.required],
//       city: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\u0621-\u064A\s]+$/)]],
//       address: ['', Validators.required],
//       violationType: ['', Validators.required],
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
//   areAttachmentsProvided(): boolean {
//     return this.attachments.some(doc => doc.file !== null);
//   }
//
//   submitRequest(): void {
//     this.markFormGroupTouched();
//     if (this.complaintForm.invalid) {
//       this.showAlert('Incomplete Data', 'Please fill in all required fields for the violation.', 'error');
//       return;
//     }
//     if (!this.areAttachmentsProvided()) {
//       this.showAlert('Evidence Required', 'Please attach at least one photo or document as evidence.', 'error');
//       return;
//     }
//     this.isLoading = true;
//     const formData = new FormData();
//     const formDetails = this.complaintForm.getRawValue();
//     if (formDetails.isAnonymous) {
//       formDetails.fullName = 'Anonymous';
//       formDetails.nationalId = 'N/A';
//       formDetails.mobileNumber = 'N/A';
//       formDetails.email = 'N/A';
//     }
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
//         this.showAlert('Success', `Your complaint has been registered successfully. Your tracking number is: ${complaintId}`, 'success');
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
//       this.showAlert('Invalid File Type', `Allowed formats: ${attachmentRequirement.description}`, 'error');
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
  selector: 'app-building-violation-complaint',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterLink ],
  templateUrl: './building-violation-complaint.html',
  styleUrls: ['./building-violation-complaint.css']
})
export class BuildingViolationComplaintComponent implements OnInit {
  complaintForm: FormGroup;
  isLoading = false;
  userData: User | null = null;
  isAlertVisible = false;
  alertTitle = '';
  alertMessage = '';
  alertType: 'success' | 'error' = 'success';
  totalFileSize: number = 0;
  maxTotalFileSize: number = 100 * 1024 * 1024;
  serviceInfo = {
    title: 'Building Violation Complaint',
    department: 'Local Municipality',
    description: 'Report any building violations to the concerned authorities. Evidence is crucial for investigation.',
    processingTime: 'Response and action time depends on the violation\'s severity.'
  };
  attachments: Attachment[] = [
    { id: 'violationPhoto', name: 'Photo/Video of Violation', description: 'JPG, PNG, MP4, PDF', allowedTypes: ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'], file: null },
    { id: 'supportingDocs', name: 'Supporting Documents (if any)', description: 'PDF', allowedTypes: ['application/pdf'], file: null }
  ];
  governorates = ['Cairo', 'Giza'];
  violationTypes = [
    'Building without a license',
    'Exceeding height/floor limits',
    'Encroachment on street/neighboring property',
    'Changing property usage (e.g., residential to commercial)',
    'Unsafe demolition or modification works',
    'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private serviceRequestService: ServiceRequestService,
    private authService: AuthService
  ) {
    this.complaintForm = this.fb.group({
      isAnonymous: [false],
      fullName: [{ value: '', disabled: true }],
      nationalId: [{ value: '', disabled: true }],
      mobileNumber: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      governorate: ['', Validators.required],
      city: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\u0621-\u064A\s]+$/)]],
      address: ['', Validators.required],
      violationType: ['', Validators.required],
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

  areAttachmentsProvided(): boolean {
    return this.attachments.some(doc => doc.file !== null);
  }

  submitRequest(): void {
    this.markFormGroupTouched();
    if (this.complaintForm.invalid) {
      this.showAlert('Incomplete Data', 'Please fill in all required fields for the violation.', 'error');
      return;
    }
    if (!this.areAttachmentsProvided()) {
      this.showAlert('Evidence Required', 'Please attach at least one photo or document as evidence.', 'error');
      return;
    }
    this.isLoading = true;
    const formData = new FormData();
    const formDetails = this.complaintForm.getRawValue();
    if (formDetails.isAnonymous) {
      formDetails.fullName = 'Anonymous';
      formDetails.nationalId = 'N/A';
      formDetails.mobileNumber = 'N/A';
      formDetails.email = 'N/A';
    }
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
        this.showAlert('Success', `Your complaint has been registered successfully. Your tracking number is: ${complaintId}`, 'success');
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
      this.showAlert('Invalid File Type', `Allowed formats: ${attachmentRequirement.description}`, 'error');
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
