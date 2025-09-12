// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { Router, RouterLink } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { ServiceRequestService } from '../../../../../services/service-request.service';
// import { AuthService } from '../../../../../services/auth.service';
// import { User } from '../../../../../interfaces/user.interface';
//
// interface RequiredDocument {
//   id: string;
//   name: string;
//   description: string;
//   allowedTypes: string[];
//   file: File | null;
// }
//
// @Component({
//   selector: 'app-building-permit-renewal',
//   standalone: true,
//   imports: [ CommonModule, ReactiveFormsModule, RouterLink ],
//   templateUrl: './building-permit-renewal.html',
//   styleUrls: ['./building-permit-renewal.css']
// })
// export class BuildingPermitRenewalComponent implements OnInit {
//   renewalForm: FormGroup;
//   isLoading = false;
//   userData: User | null = null;
//   isAlertVisible = false;
//   alertTitle = '';
//   alertMessage = '';
//   alertType: 'success' | 'error' = 'success';
//   totalFileSize: number = 0;
//   maxTotalFileSize: number = 100 * 1024 * 1024;
//
//   serviceInfo = {
//     title: 'Building Permit Renewal',
//     department: 'Local Municipality',
//     description: 'Apply to renew an existing building permit before its expiration.',
//     processingTime: 'Estimated processing time: 7-10 business days after request completion and approvals.'
//   };
//
//   governorates = ['Cairo', 'Giza'];
//
//   requiredDocuments: RequiredDocument[] = [
//     { id: 'nationalIdFile', name: 'National ID or Passport', description: 'PDF, JPG, PNG', allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'], file: null },
//     { id: 'powerOfAttorneyFile', name: 'Power of Attorney (if applicable)', description: 'PDF', allowedTypes: ['application/pdf'], file: null },
//     { id: 'originalPermitFile', name: 'Copy of the previous/expired permit', description: 'PDF', allowedTypes: ['application/pdf'], file: null },
//     { id: 'titleDeedFile', name: 'Proof of current ownership', description: 'PDF', allowedTypes: ['application/pdf'], file: null },
//     { id: 'permitStatusCertFile', name: 'Certificate that the permit was not revoked', description: 'PDF', allowedTypes: ['application/pdf'], file: null },
//     { id: 'engineeringReportFile', name: 'Engineering report on the building status', description: 'PDF', allowedTypes: ['application/pdf'], file: null },
//     { id: 'updatedDrawingsFile', name: 'Updated drawings (if modified)', description: 'PDF', allowedTypes: ['application/pdf'], file: null },
//     { id: 'engineerDeclarationFile', name: 'Declaration from a consultant engineer', description: 'PDF', allowedTypes: ['application/pdf'], file: null },
//     { id: 'approvalsFile', name: 'Renewed approvals (Utilities, Civil Defense)', description: 'PDF', allowedTypes: ['application/pdf'], file: null },
//     { id: 'receiptsFile', name: 'Fee payment receipts', description: 'PDF, JPG', allowedTypes: ['application/pdf', 'image/jpeg'], file: null }
//   ];
//
//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private serviceRequestService: ServiceRequestService,
//     private authService: AuthService
//   ) {
//     this.renewalForm = this.fb.group({
//       fullName: [{ value: '', disabled: true }, Validators.required],
//       nationalId: [{ value: '', disabled: true }, Validators.required],
//       mobileNumber: [{ value: '', disabled: true }, Validators.required],
//       email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
//       governorate: ['', Validators.required],
//       originalPermitNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
//       // ✅ START: تم تحديث قواعد التحقق هنا
//       engineeringReport: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(1000)]],
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
//       this.renewalForm.patchValue({
//         fullName: currentUser.fullName,
//         nationalId: currentUser.nationalId,
//         email: currentUser.email,
//         mobileNumber: currentUser.phoneNumber,
//       });
//     }
//   }
//
//   areAllDocumentsUploaded(): boolean {
//     return this.requiredDocuments.every(doc => doc.file !== null);
//   }
//
//   submitRequest(): void {
//     this.markFormGroupTouched();
//     if (this.renewalForm.invalid) {
//       this.showAlert('Incomplete Data', 'Please fill in all required fields correctly.', 'error');
//       return;
//     }
//     if (!this.areAllDocumentsUploaded()) {
//       this.showAlert('Missing Documents', 'Please upload all required documents.', 'error');
//       return;
//     }
//
//     this.isLoading = true;
//     const formData = new FormData();
//     const formDetails = this.renewalForm.getRawValue();
//     const requestPayload = {
//       serviceName: this.serviceInfo.title,
//       department: 'Local Municipality',
//       details: JSON.stringify(formDetails)
//     };
//
//     formData.append('request', JSON.stringify(requestPayload));
//     this.requiredDocuments.forEach(doc => {
//       if (doc.file) {
//         formData.append('files', doc.file, doc.file.name);
//       }
//     });
//
//     this.serviceRequestService.createRequest(formData).subscribe({
//       next: (response: any) => {
//         this.isLoading = false;
//         const newRequestId = response.id;
//         this.showAlert('Success', 'Your permit renewal request has been submitted successfully! Redirecting to payment...', 'success');
//         setTimeout(() => {
//           this.hideAlert();
//           this.router.navigate(['/payments', newRequestId]);
//         }, 2000);
//       },
//       error: (error: any) => {
//         this.isLoading = false;
//         console.error('Error submitting request:', error);
//         this.showAlert('Submission Failed', 'An error occurred while submitting your request. Please try again.', 'error');
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
//     const documentRequirement = this.requiredDocuments[index];
//     const oldFileSize = documentRequirement.file ? documentRequirement.file.size : 0;
//
//     if (this.totalFileSize - oldFileSize + file.size > this.maxTotalFileSize) {
//       const maxSizeInMB = this.maxTotalFileSize / (1024 * 1024);
//       this.showAlert('File Size Limit Exceeded', `The total size of all files cannot exceed ${maxSizeInMB} MB.`, 'error');
//       event.target.value = null;
//       return;
//     }
//
//     if (documentRequirement.allowedTypes.includes(file.type)) {
//       this.totalFileSize = this.totalFileSize - oldFileSize + file.size;
//       documentRequirement.file = file;
//     } else {
//       this.showAlert('Invalid File Type', `File format not allowed. Allowed formats: ${documentRequirement.description}`, 'error');
//     }
//     event.target.value = null;
//   }
//
//   removeFile(index: number): void {
//     const documentRequirement = this.requiredDocuments[index];
//     if (documentRequirement.file) {
//       this.totalFileSize -= documentRequirement.file.size;
//       documentRequirement.file = null;
//     }
//   }
//
//   markFormGroupTouched(): void {
//     Object.values(this.renewalForm.controls).forEach(control => {
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

interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  allowedTypes: string[];
  file: File | null;
}

@Component({
  selector: 'app-building-permit-renewal',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterLink ],
  templateUrl: './building-permit-renewal.html',
  styleUrls: ['./building-permit-renewal.css']
})
export class BuildingPermitRenewalComponent implements OnInit {
  renewalForm: FormGroup;
  isLoading = false;
  userData: User | null = null;
  isAlertVisible = false;
  alertTitle = '';
  alertMessage = '';
  alertType: 'success' | 'error' = 'success';
  totalFileSize: number = 0;
  maxTotalFileSize: number = 100 * 1024 * 1024;

  serviceInfo = {
    title: 'Building Permit Renewal',
    department: 'Local Municipality',
    description: 'Apply to renew an existing building permit before its expiration.',
    processingTime: 'Estimated processing time: 7-10 business days after request completion and approvals.'
  };

  governorates = ['Cairo', 'Giza'];

  requiredDocuments: RequiredDocument[] = [
    { id: 'nationalIdFile', name: 'National ID or Passport', description: 'PDF, JPG, PNG', allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'], file: null },
    { id: 'powerOfAttorneyFile', name: 'Power of Attorney (if applicable)', description: 'PDF', allowedTypes: ['application/pdf'], file: null },
    { id: 'originalPermitFile', name: 'Copy of the previous/expired permit', description: 'PDF', allowedTypes: ['application/pdf'], file: null },
    { id: 'titleDeedFile', name: 'Proof of current ownership', description: 'PDF', allowedTypes: ['application/pdf'], file: null },
    { id: 'permitStatusCertFile', name: 'Certificate that the permit was not revoked', description: 'PDF', allowedTypes: ['application/pdf'], file: null },
    { id: 'engineeringReportFile', name: 'Engineering report on the building status', description: 'PDF', allowedTypes: ['application/pdf'], file: null },
    { id: 'updatedDrawingsFile', name: 'Updated drawings (if modified)', description: 'PDF', allowedTypes: ['application/pdf'], file: null },
    { id: 'engineerDeclarationFile', name: 'Declaration from a consultant engineer', description: 'PDF', allowedTypes: ['application/pdf'], file: null },
    { id: 'approvalsFile', name: 'Renewed approvals (Utilities, Civil Defense)', description: 'PDF', allowedTypes: ['application/pdf'], file: null },
    { id: 'receiptsFile', name: 'Fee payment receipts', description: 'PDF, JPG', allowedTypes: ['application/pdf', 'image/jpeg'], file: null }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private serviceRequestService: ServiceRequestService,
    private authService: AuthService
  ) {
    this.renewalForm = this.fb.group({
      fullName: [{ value: '', disabled: true }, Validators.required],
      nationalId: [{ value: '', disabled: true }, Validators.required],
      mobileNumber: [{ value: '', disabled: true }, Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      governorate: ['', Validators.required],
      originalPermitNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      // ✅ START: تم تحديث قواعد التحقق هنا
      engineeringReport: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(1000)]],
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
      this.renewalForm.patchValue({
        fullName: currentUser.fullName,
        nationalId: currentUser.nationalId,
        email: currentUser.email,
        mobileNumber: currentUser.phoneNumber,
      });
    }
  }

  areAllDocumentsUploaded(): boolean {
    return this.requiredDocuments.every(doc => doc.file !== null);
  }

  submitRequest(): void {
    this.markFormGroupTouched();
    if (this.renewalForm.invalid) {
      this.showAlert('Incomplete Data', 'Please fill in all required fields correctly.', 'error');
      return;
    }
    if (!this.areAllDocumentsUploaded()) {
      this.showAlert('Missing Documents', 'Please upload all required documents.', 'error');
      return;
    }

    this.isLoading = true;
    const formData = new FormData();
    const formDetails = this.renewalForm.getRawValue();
    const requestPayload = {
      serviceName: this.serviceInfo.title,
      department: 'Local Municipality',
      details: JSON.stringify(formDetails)
    };

    formData.append('request', JSON.stringify(requestPayload));
    this.requiredDocuments.forEach(doc => {
      if (doc.file) {
        formData.append('files', doc.file, doc.file.name);
      }
    });

    this.serviceRequestService.createRequest(formData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        const newRequestId = response.id;
        this.showAlert('Success', 'Your permit renewal request has been submitted successfully! Redirecting to payment...', 'success');
        setTimeout(() => {
          this.hideAlert();
          this.router.navigate(['/payments', newRequestId]);
        }, 2000);
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error submitting request:', error);
        this.showAlert('Submission Failed', 'An error occurred while submitting your request. Please try again.', 'error');
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
    const documentRequirement = this.requiredDocuments[index];
    const oldFileSize = documentRequirement.file ? documentRequirement.file.size : 0;

    if (this.totalFileSize - oldFileSize + file.size > this.maxTotalFileSize) {
      const maxSizeInMB = this.maxTotalFileSize / (1024 * 1024);
      this.showAlert('File Size Limit Exceeded', `The total size of all files cannot exceed ${maxSizeInMB} MB.`, 'error');
      event.target.value = null;
      return;
    }

    if (documentRequirement.allowedTypes.includes(file.type)) {
      this.totalFileSize = this.totalFileSize - oldFileSize + file.size;
      documentRequirement.file = file;
    } else {
      this.showAlert('Invalid File Type', `File format not allowed. Allowed formats: ${documentRequirement.description}`, 'error');
    }
    event.target.value = null;
  }

  removeFile(index: number): void {
    const documentRequirement = this.requiredDocuments[index];
    if (documentRequirement.file) {
      this.totalFileSize -= documentRequirement.file.size;
      documentRequirement.file = null;
    }
  }

  markFormGroupTouched(): void {
    Object.values(this.renewalForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  cancel(): void {
    this.router.navigate(['/municipality-services']);
  }
}
