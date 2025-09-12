// import { Component, OnDestroy, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router, RouterLink } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { Subscription } from 'rxjs';
//
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
//   selector: 'app-license-replacement',
//   standalone: true,
//   templateUrl: './license-replacement.html',
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     RouterLink
//   ],
//   styleUrls: ['./license-replacement.css']
// })
// export class LicenseReplacementComponent implements OnInit, OnDestroy {
//   replacementForm: FormGroup;
//   isLoading = false;
//   userInfo: User | null = null;
//   private reasonSubscription: Subscription | undefined;
//
//   isAlertVisible = false;
//   alertTitle = '';
//   alertMessage = '';
//   alertType: 'success' | 'error' = 'success';
//
//   totalFileSize: number = 0;
//   maxTotalFileSize: number = 100 * 1024 * 1024; // 100 MB
//
//   dynamicDocumentHelpText: string | null = null;
//
//   serviceDetails = {
//     title: 'License Replacement',
//     description: 'Request a replacement for your lost or damaged driver\'s license.',
//     processingTime: '2-3 business days'
//   };
//
//   baseDocuments: RequiredDocument[] = [
//     { id: 'nationalIdCopy', name: 'Copy of a valid National ID', description: 'Front and back. Allowed: PDF, JPG', allowedTypes: ['application/pdf', 'image/jpeg'], file: null },
//     { id: 'personalPhoto', name: 'Recent Personal Photograph', description: 'White background. Allowed: JPG, PNG', allowedTypes: ['image/jpeg', 'image/png'], file: null }
//   ];
//
//   lostLicenseDoc: RequiredDocument = { id: 'policeReport', name: 'Official Police Report', description: 'Required for lost license. Allowed: PDF', allowedTypes: ['application/pdf'], file: null };
//   damagedLicenseDoc: RequiredDocument = { id: 'damagedLicenseCopy', name: 'Copy of the Damaged License', description: 'Required for damaged license. Allowed: PDF, JPG', allowedTypes: ['application/pdf', 'image/jpeg'], file: null };
//
//   requiredDocuments: RequiredDocument[] = [...this.baseDocuments];
//
//   licenseCategories = ['Private', 'Motorcycle', 'Professional - 3rd Grade', 'Professional - 2nd Grade', 'Professional - 1st Grade'];
//   deliveryOptions = ['Pickup at Traffic Unit', 'Mail Delivery'];
//   governorates = ['Cairo', 'Giza'];
//
//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private serviceRequestService: ServiceRequestService,
//     private authService: AuthService
//   ) {
//     this.replacementForm = this.fb.group({
//       fullName: [{ value: '', disabled: true }, Validators.required],
//       nationalId: [{ value: '', disabled: true }, Validators.required],
//       age: [{ value: '', disabled: true }],
//       governorate: ['', Validators.required],
//       currentAddress: [{ value: '', disabled: true }, Validators.required],
//       mobileNumber: [{ value: '', disabled: true }, Validators.required],
//       email: [{ value: '', disabled: true }, Validators.required],
//       licenseNumber: ['', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]],
//       licenseCategory: ['Private', Validators.required],
//       reason: ['', Validators.required],
//       deliveryMethod: ['Pickup at Traffic Unit', Validators.required]
//     });
//   }
//
//   ngOnInit(): void {
//     this.loadUserData();
//     this.subscribeToReasonChanges();
//   }
//
//   ngOnDestroy(): void {
//     this.reasonSubscription?.unsubscribe();
//   }
//
//   private calculateAgeFromNationalId(nationalId: string): number | null {
//     if (!nationalId || nationalId.length !== 14) return null;
//     const century = nationalId[0] === '2' ? 1900 : 2000;
//     const year = century + parseInt(nationalId.substring(1, 3), 10);
//     const month = parseInt(nationalId.substring(3, 5), 10);
//     const day = parseInt(nationalId.substring(5, 7), 10);
//     const birthDate = new Date(year, month - 1, day);
//     const today = new Date();
//     let age = today.getFullYear() - birthDate.getFullYear();
//     const m = today.getMonth() - birthDate.getMonth();
//     if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
//     return age;
//   }
//
//   loadUserData(): void {
//     const currentUser = this.authService.currentUser();
//     if (currentUser) {
//       this.userInfo = currentUser;
//       const age = this.calculateAgeFromNationalId(currentUser.nationalId || '');
//       this.replacementForm.patchValue({
//         fullName: currentUser.fullName,
//         nationalId: currentUser.nationalId,
//         age: age ? `${age} years` : '',
//         // تم إزالة السطر التالي: governorate: currentUser.governorate,
//         currentAddress: currentUser.address,
//         mobileNumber: currentUser.phoneNumber,
//         email: currentUser.email
//       });
//     }
//   }
//
//   private subscribeToReasonChanges(): void {
//     this.reasonSubscription = this.replacementForm.get('reason')?.valueChanges.subscribe(reason => {
//       this.requiredDocuments = [...this.baseDocuments];
//       this.dynamicDocumentHelpText = null;
//
//       if (reason === 'Lost') {
//         this.requiredDocuments.push(this.lostLicenseDoc);
//         this.dynamicDocumentHelpText = '* Please make sure to upload the Official Police Report.';
//       } else if (reason === 'Damaged') {
//         this.requiredDocuments.push(this.damagedLicenseDoc);
//         this.dynamicDocumentHelpText = '* Please make sure to upload a copy of the Damaged License.';
//       }
//     });
//   }
//
//   areAllDocumentsUploaded(): boolean { return this.requiredDocuments.every(doc => doc.file !== null); }
//   onFileSelected(event: any, index: number): void { const file = event.target.files?.[0]; if (!file) return; const documentRequirement = this.requiredDocuments[index]; const oldFileSize = documentRequirement.file ? documentRequirement.file.size : 0; if (this.totalFileSize - oldFileSize + file.size > this.maxTotalFileSize) { const maxSizeInMB = this.maxTotalFileSize / (1024 * 1024); this.showAlert('File Size Limit Exceeded', `The total size of all files cannot exceed ${maxSizeInMB} MB.`, 'error'); event.target.value = null; return; } if (documentRequirement.allowedTypes.includes(file.type)) { this.totalFileSize = this.totalFileSize - oldFileSize + file.size; documentRequirement.file = file; } else { this.showAlert('Invalid File Type', `File format not allowed. Please upload: ${documentRequirement.description}`, 'error'); } event.target.value = null; }
//   removeFile(index: number): void { const documentRequirement = this.requiredDocuments[index]; if (documentRequirement.file) { this.totalFileSize -= documentRequirement.file.size; documentRequirement.file = null; } }
//
//   onSubmit(): void {
//     if (this.replacementForm.invalid) {
//       this.replacementForm.markAllAsTouched();
//       this.showAlert('Missing Information', 'Please fill in all required fields correctly.', 'error');
//       return;
//     }
//     if (!this.areAllDocumentsUploaded()) {
//       this.showAlert('Missing Documents', 'Please upload all the required documents.', 'error');
//       return;
//     }
//     this.isLoading = true;
//     const formData = new FormData();
//     const formDetails = this.replacementForm.getRawValue();
//     const requestPayload = {
//       serviceName: this.serviceDetails.title,
//       department: 'Traffic Department',
//       details: JSON.stringify(formDetails)
//     };
//     formData.append('request', JSON.stringify(requestPayload));
//     this.requiredDocuments.forEach(doc => {
//       if (doc.file) {
//         formData.append('files', doc.file, doc.file.name);
//       }
//     });
//     this.serviceRequestService.createRequest(formData).subscribe({
//       next: (response: any) => {
//         this.isLoading = false;
//         const newRequestId = response.id;
//         this.showAlert('Success', 'Your license replacement request has been submitted successfully! Redirecting to payment...', 'success');
//         setTimeout(() => {
//           this.hideAlert();
//           this.router.navigate(['/payments', newRequestId]);
//         }, 2000);
//       },
//       error: (error) => {
//         this.isLoading = false;
//         console.error('Error submitting request', error);
//         this.showAlert('Submission Failed', 'There was an error submitting your request. Please try again.', 'error');
//       }
//     });
//   }
//
//   showAlert(title: string, message: string, type: 'success' | 'error' = 'success') { this.alertTitle = title; this.alertMessage = message; this.alertType = type; this.isAlertVisible = true; }
//   hideAlert() { this.isAlertVisible = false; }
//   onCancel(): void { this.router.navigate(['/traffic-services']); }
// }





import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

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
  selector: 'app-license-replacement',
  standalone: true,
  templateUrl: './license-replacement.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  styleUrls: ['./license-replacement.css']
})
export class LicenseReplacementComponent implements OnInit, OnDestroy {
  replacementForm: FormGroup;
  isLoading = false;
  userInfo: User | null = null;
  private reasonSubscription: Subscription | undefined;

  isAlertVisible = false;
  alertTitle = '';
  alertMessage = '';
  alertType: 'success' | 'error' = 'success';

  totalFileSize: number = 0;
  maxTotalFileSize: number = 100 * 1024 * 1024; // 100 MB

  dynamicDocumentHelpText: string | null = null;

  serviceDetails = {
    title: 'License Replacement',
    description: 'Request a replacement for your lost or damaged driver\'s license.',
    processingTime: '2-3 business days'
  };

  baseDocuments: RequiredDocument[] = [
    { id: 'nationalIdCopy', name: 'Copy of a valid National ID', description: 'Front and back. Allowed: PDF, JPG', allowedTypes: ['application/pdf', 'image/jpeg'], file: null },
    { id: 'personalPhoto', name: 'Recent Personal Photograph', description: 'White background. Allowed: JPG, PNG', allowedTypes: ['image/jpeg', 'image/png'], file: null }
  ];

  lostLicenseDoc: RequiredDocument = { id: 'policeReport', name: 'Official Police Report', description: 'Required for lost license. Allowed: PDF', allowedTypes: ['application/pdf'], file: null };
  damagedLicenseDoc: RequiredDocument = { id: 'damagedLicenseCopy', name: 'Copy of the Damaged License', description: 'Required for damaged license. Allowed: PDF, JPG', allowedTypes: ['application/pdf', 'image/jpeg'], file: null };

  requiredDocuments: RequiredDocument[] = [...this.baseDocuments];

  licenseCategories = ['Private', 'Motorcycle', 'Professional - 3rd Grade', 'Professional - 2nd Grade', 'Professional - 1st Grade'];
  deliveryOptions = ['Pickup at Traffic Unit', 'Mail Delivery'];
  governorates = ['Cairo', 'Giza'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private serviceRequestService: ServiceRequestService,
    private authService: AuthService
  ) {
    this.replacementForm = this.fb.group({
      fullName: [{ value: '', disabled: true }, Validators.required],
      nationalId: [{ value: '', disabled: true }, Validators.required],
      age: [{ value: '', disabled: true }],
      governorate: ['', Validators.required],
      currentAddress: [{ value: '', disabled: true }, Validators.required],
      mobileNumber: [{ value: '', disabled: true }, Validators.required],
      email: [{ value: '', disabled: true }, Validators.required],
      licenseNumber: ['', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]],
      licenseCategory: ['Private', Validators.required],
      reason: ['', Validators.required],
      deliveryMethod: ['Pickup at Traffic Unit', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserData();
    this.subscribeToReasonChanges();
  }

  ngOnDestroy(): void {
    this.reasonSubscription?.unsubscribe();
  }

  private calculateAgeFromNationalId(nationalId: string): number | null {
    if (!nationalId || nationalId.length !== 14) return null;
    const century = nationalId[0] === '2' ? 1900 : 2000;
    const year = century + parseInt(nationalId.substring(1, 3), 10);
    const month = parseInt(nationalId.substring(3, 5), 10);
    const day = parseInt(nationalId.substring(5, 7), 10);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }

  loadUserData(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.userInfo = currentUser;
      const age = this.calculateAgeFromNationalId(currentUser.nationalId || '');
      this.replacementForm.patchValue({
        fullName: currentUser.fullName,
        nationalId: currentUser.nationalId,
        age: age ? `${age} years` : '',
        // تم إزالة السطر التالي: governorate: currentUser.governorate,
        currentAddress: currentUser.address,
        mobileNumber: currentUser.phoneNumber,
        email: currentUser.email
      });
    }
  }

  private subscribeToReasonChanges(): void {
    this.reasonSubscription = this.replacementForm.get('reason')?.valueChanges.subscribe(reason => {
      this.requiredDocuments = [...this.baseDocuments];
      this.dynamicDocumentHelpText = null;

      if (reason === 'Lost') {
        this.requiredDocuments.push(this.lostLicenseDoc);
        this.dynamicDocumentHelpText = '* Please make sure to upload the Official Police Report.';
      } else if (reason === 'Damaged') {
        this.requiredDocuments.push(this.damagedLicenseDoc);
        this.dynamicDocumentHelpText = '* Please make sure to upload a copy of the Damaged License.';
      }
    });
  }

  areAllDocumentsUploaded(): boolean { return this.requiredDocuments.every(doc => doc.file !== null); }
  onFileSelected(event: any, index: number): void { const file = event.target.files?.[0]; if (!file) return; const documentRequirement = this.requiredDocuments[index]; const oldFileSize = documentRequirement.file ? documentRequirement.file.size : 0; if (this.totalFileSize - oldFileSize + file.size > this.maxTotalFileSize) { const maxSizeInMB = this.maxTotalFileSize / (1024 * 1024); this.showAlert('File Size Limit Exceeded', `The total size of all files cannot exceed ${maxSizeInMB} MB.`, 'error'); event.target.value = null; return; } if (documentRequirement.allowedTypes.includes(file.type)) { this.totalFileSize = this.totalFileSize - oldFileSize + file.size; documentRequirement.file = file; } else { this.showAlert('Invalid File Type', `File format not allowed. Please upload: ${documentRequirement.description}`, 'error'); } event.target.value = null; }
  removeFile(index: number): void { const documentRequirement = this.requiredDocuments[index]; if (documentRequirement.file) { this.totalFileSize -= documentRequirement.file.size; documentRequirement.file = null; } }

  onSubmit(): void {
    if (this.replacementForm.invalid) {
      this.replacementForm.markAllAsTouched();
      this.showAlert('Missing Information', 'Please fill in all required fields correctly.', 'error');
      return;
    }
    if (!this.areAllDocumentsUploaded()) {
      this.showAlert('Missing Documents', 'Please upload all the required documents.', 'error');
      return;
    }
    this.isLoading = true;
    const formData = new FormData();
    const formDetails = this.replacementForm.getRawValue();
    const requestPayload = {
      serviceName: this.serviceDetails.title,
      department: 'Traffic Department',
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
        this.showAlert('Success', 'Your license replacement request has been submitted successfully! Redirecting to payment...', 'success');
        setTimeout(() => {
          this.hideAlert();
          this.router.navigate(['/payments', newRequestId]);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error submitting request', error);
        this.showAlert('Submission Failed', 'There was an error submitting your request. Please try again.', 'error');
      }
    });
  }

  showAlert(title: string, message: string, type: 'success' | 'error' = 'success') { this.alertTitle = title; this.alertMessage = message; this.alertType = type; this.isAlertVisible = true; }
  hideAlert() { this.isAlertVisible = false; }
  onCancel(): void { this.router.navigate(['/traffic-services']); }
}
