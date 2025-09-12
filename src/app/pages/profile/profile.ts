// import { Component, OnInit } from '@angular/core';
// import { CommonModule, KeyValuePipe } from '@angular/common'; // KeyValuePipe might be needed if not already global
// import { FormsModule } from '@angular/forms';
// // ✅ START: الإضافة المطلوبة
// import { Router, RouterLink } from '@angular/router'; // 1. إضافة RouterLink
// // ✅ END: نهاية الإضافة
// import { ProfileService, UserProfile } from '../../services/profile.service';
//
// @Component({
//   selector: 'app-profile',
//   standalone: true,
//   // ✅ START: الإضافة المطلوبة
//   imports: [CommonModule, FormsModule, RouterLink, KeyValuePipe], // 2. إضافة RouterLink و KeyValuePipe هنا
//   // ✅ END: نهاية الإضافة
//   templateUrl: './profile.html',
//   styleUrls: ['./profile.css']
// })
// export class ProfileComponent implements OnInit {
//   userProfile: UserProfile = {
//     id: 0,
//     fullName: '',
//     email: '',
//     phoneNumber: '',
//     department: '',
//     position: '',
//     avatar: '',
//     createdAt: new Date(),
//     nationalId: '',
//     address: '',
//     notifications: { email: true, sms: true, marketing: false }
//   };
//
//   currentPassword = '';
//   newPassword = '';
//   confirmPassword = '';
//
//   isEditing = false;
//   selectedFile: File | null = null;
//   previewUrl: string | null = null;
//   isLoading = false;
//
//   toastMessage: string | null = null;
//   toastType: 'success' | 'error' | null = null;
//
//   showConfirmationPopup = false;
//   confirmationTitle = '';
//   confirmationMessage = '';
//   private onConfirmAction: (() => void) | null = null;
//
//   newPasswordVisible = false;
//   confirmPasswordVisible = false;
//   passwordValidations = {
//     length: { text: 'At least 8 characters long', valid: false },
//     uppercase: { text: 'Contains an uppercase letter', valid: false },
//     lowercase: { text: 'Contains a lowercase letter', valid: false },
//     number: { text: 'Contains a number', valid: false },
//     special: { text: 'Contains a special character (!@#$%^&*)', valid: false }
//   };
//
//   currentPasswordVisible: boolean = false;
//
//   constructor(private profileService: ProfileService, private router: Router) {}
//
//   ngOnInit(): void {
//     this.loadUserProfile();
//   }
//
//   private showToast(message: string, type: 'success' | 'error'): void {
//     this.toastMessage = message;
//     this.toastType = type;
//     setTimeout(() => { this.toastMessage = null; this.toastType = null; }, 4000);
//   }
//
//   loadUserProfile(): void {
//     this.isLoading = true;
//     this.profileService.getUserProfile().subscribe({
//       next: (profile) => { this.userProfile = profile; this.isLoading = false; },
//       error: (error) => {
//         console.error('Error loading profile:', error);
//         this.showToast('Failed to load profile data.', 'error');
//         this.isLoading = false;
//       }
//     });
//   }
//
//   enableEditing(): void {
//     this.isEditing = true;
//     this.currentPassword = '';
//     this.newPassword = '';
//     this.confirmPassword = '';
//     this.validatePassword();
//   }
//
//   cancelEditing(): void {
//     this.isEditing = false;
//     this.selectedFile = null;
//     this.previewUrl = null;
//     this.currentPassword = '';
//     this.newPassword = '';
//     this.confirmPassword = '';
//     this.loadUserProfile();
//   }
//
//   onFileSelected(event: any): void {
//     const file = event.target.files[0];
//     if (file) {
//       if (!file.type.match('image.*')) { this.showToast('Please select an image file.', 'error'); return; }
//       if (file.size > 2 * 1024 * 1024) { this.showToast('Image size should be less than 2MB.', 'error'); return; }
//       this.selectedFile = file;
//       const reader = new FileReader();
//       reader.onload = () => { this.previewUrl = reader.result as string; };
//       reader.readAsDataURL(file);
//     }
//   }
//
//   toggleCurrentPasswordVisibility(): void {
//     this.currentPasswordVisible = !this.currentPasswordVisible;
//   }
//
//   updatePassword(): void {
//     if (!this.isPasswordValid()) {
//       this.showToast('Please ensure the new password meets all criteria and matches the confirmation.', 'error');
//       return;
//     }
//
//     this.isLoading = true;
//     this.profileService.changePassword(this.currentPassword, this.newPassword).subscribe({
//       next: (response) => {
//         this.showToast(response.message, 'success');
//         this.isLoading = false;
//         this.currentPassword = '';
//         this.newPassword = '';
//         this.confirmPassword = '';
//         this.validatePassword();
//       },
//       error: (error) => {
//         console.error('Error changing password:', error);
//         this.showToast(error.error?.message || 'Error changing password. Check current password.', 'error');
//         this.isLoading = false;
//       }
//     });
//   }
//
//   saveProfile(): void {
//     this.isLoading = true;
//     this.profileService.updateProfile(this.userProfile, this.selectedFile).subscribe({
//       next: (updatedProfile) => {
//         this.userProfile = updatedProfile;
//         this.isEditing = false;
//         this.selectedFile = null;
//         this.previewUrl = null;
//         this.showToast('Profile updated successfully!', 'success');
//         this.isLoading = false;
//       },
//       error: (error) => {
//         console.error('Error updating profile:', error);
//         this.showToast('Error updating profile. Please try again.', 'error');
//         this.isLoading = false;
//       }
//     });
//   }
//
//   removeAvatar(): void {
//     this.confirmationTitle = 'Confirm Deletion';
//     this.confirmationMessage = 'Are you sure you want to remove your profile picture? This action cannot be undone.';
//     this.onConfirmAction = this.proceedWithAvatarRemoval.bind(this);
//     this.showConfirmationPopup = true;
//   }
//
//   private proceedWithAvatarRemoval(): void {
//     this.isLoading = true;
//     this.profileService.deleteAvatar().subscribe({
//       next: () => {
//         this.userProfile.avatar = '';
//         this.previewUrl = null;
//         this.selectedFile = null;
//         this.showToast('Avatar removed successfully.', 'success');
//         this.isLoading = false;
//       },
//       error: (err) => {
//         console.error('Error removing avatar:', err);
//         this.showToast('Failed to remove avatar.', 'error');
//         this.isLoading = false;
//       }
//     });
//   }
//
//   onConfirm(): void {
//     if (this.onConfirmAction) { this.onConfirmAction(); }
//     this.closeConfirmationPopup();
//   }
//
//   closeConfirmationPopup(): void {
//     this.showConfirmationPopup = false;
//     this.onConfirmAction = null;
//   }
//
//   onNotificationChange(type: keyof typeof this.userProfile.notifications, event: any): void {
//     if (this.isEditing) { this.userProfile.notifications[type] = event.target.checked; }
//   }
//
//   getInitials(): string {
//     return this.userProfile.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '';
//   }
//
//   toggleNewPasswordVisibility(): void { this.newPasswordVisible = !this.newPasswordVisible; }
//   toggleConfirmPasswordVisibility(): void { this.confirmPasswordVisible = !this.confirmPasswordVisible; }
//
//   validatePassword(): void {
//     const pass = this.newPassword;
//     this.passwordValidations.length.valid = pass.length >= 8;
//     this.passwordValidations.uppercase.valid = /[A-Z]/.test(pass);
//     this.passwordValidations.lowercase.valid = /[a-z]/.test(pass);
//     this.passwordValidations.number.valid = /[0-9]/.test(pass);
//     this.passwordValidations.special.valid = /[!@#$%^&*]/.test(pass);
//   }
//
//   isPasswordValid(): boolean {
//     if (!this.currentPassword || this.newPassword !== this.confirmPassword) {
//       return false;
//     }
//     return Object.values(this.passwordValidations).every(rule => rule.valid);
//   }
// }

//
// import { Component, OnInit, WritableSignal } from '@angular/core'; // ✅ 1. استيراد WritableSignal
// import { CommonModule, KeyValuePipe } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router, RouterLink } from '@angular/router';
// import { ProfileService, UserProfile } from '../../services/profile.service';
// import { AuthService, User } from '../../services/auth.service'; // تم استيراد User أيضًا
//
// @Component({
//   selector: 'app-profile',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterLink, KeyValuePipe],
//   templateUrl: './profile.html',
//   styleUrls: ['./profile.css']
// })
// export class ProfileComponent implements OnInit {
//   userProfile: UserProfile & { employeeCode?: string, position?: string } = {
//     id: 0,
//     fullName: '',
//     email: '',
//     phoneNumber: '',
//     department: '',
//     position: '',
//     avatar: '',
//     createdAt: new Date(),
//     nationalId: '',
//     address: '',
//     employeeCode: '',
//     notifications: { email: true, sms: true, marketing: false }
//   };
//
//   // ✅ 2. تعريف المتغير هنا بدون إعطائه قيمة أولية
//   currentUser: WritableSignal<User | null>;
//
//   currentPassword = '';
//   newPassword = '';
//   confirmPassword = '';
//   isEditing = false;
//   selectedFile: File | null = null;
//   previewUrl: string | null = null;
//   isLoading = false;
//   toastMessage: string | null = null;
//   toastType: 'success' | 'error' | null = null;
//   showConfirmationPopup = false;
//   confirmationTitle = '';
//   confirmationMessage = '';
//   private onConfirmAction: (() => void) | null = null;
//   newPasswordVisible = false;
//   confirmPasswordVisible = false;
//   passwordValidations = {
//     length: { text: 'At least 8 characters long', valid: false },
//     uppercase: { text: 'Contains an uppercase letter', valid: false },
//     lowercase: { text: 'Contains a lowercase letter', valid: false },
//     number: { text: 'Contains a number', valid: false },
//     special: { text: 'Contains a special character (!@#$%^&*)', valid: false }
//   };
//   currentPasswordVisible: boolean = false;
//
//   constructor(
//     private profileService: ProfileService,
//     private router: Router,
//     private authService: AuthService
//   ) {
//     // ✅ 3. إسناد القيمة هنا داخل الـ constructor بعد أن أصبحت authService متاحة
//     this.currentUser = this.authService.currentUser;
//   }
//
//   ngOnInit(): void {
//     this.loadUserProfile();
//   }
//
//   private showToast(message: string, type: 'success' | 'error'): void {
//     this.toastMessage = message;
//     this.toastType = type;
//     setTimeout(() => { this.toastMessage = null; this.toastType = null; }, 4000);
//   }
//
//   loadUserProfile(): void {
//     this.isLoading = true;
//     this.profileService.getUserProfile().subscribe({
//       next: (profile) => { this.userProfile = profile; this.isLoading = false; },
//       error: (error) => {
//         console.error('Error loading profile:', error);
//         this.showToast('Failed to load profile data.', 'error');
//         this.isLoading = false;
//       }
//     });
//   }
//
//   enableEditing(): void {
//     this.isEditing = true;
//     this.currentPassword = '';
//     this.newPassword = '';
//     this.confirmPassword = '';
//     this.validatePassword();
//   }
//
//   cancelEditing(): void {
//     this.isEditing = false;
//     this.selectedFile = null;
//     this.previewUrl = null;
//     this.currentPassword = '';
//     this.newPassword = '';
//     this.confirmPassword = '';
//     this.loadUserProfile();
//   }
//
//   onFileSelected(event: any): void {
//     const file = event.target.files[0];
//     if (file) {
//       if (!file.type.match('image.*')) { this.showToast('Please select an image file.', 'error'); return; }
//       if (file.size > 2 * 1024 * 1024) { this.showToast('Image size should be less than 2MB.', 'error'); return; }
//       this.selectedFile = file;
//       const reader = new FileReader();
//       reader.onload = () => { this.previewUrl = reader.result as string; };
//       reader.readAsDataURL(file);
//     }
//   }
//
//   toggleCurrentPasswordVisibility(): void {
//     this.currentPasswordVisible = !this.currentPasswordVisible;
//   }
//
//   updatePassword(): void {
//     if (!this.isPasswordValid()) {
//       this.showToast('Please ensure the new password meets all criteria and matches the confirmation.', 'error');
//       return;
//     }
//
//     this.isLoading = true;
//     this.profileService.changePassword(this.currentPassword, this.newPassword).subscribe({
//       next: (response) => {
//         this.showToast(response.message, 'success');
//         this.isLoading = false;
//         this.currentPassword = '';
//         this.newPassword = '';
//         this.confirmPassword = '';
//         this.validatePassword();
//       },
//       error: (error) => {
//         console.error('Error changing password:', error);
//         this.showToast(error.error?.message || 'Error changing password. Check current password.', 'error');
//         this.isLoading = false;
//       }
//     });
//   }
//
//   saveProfile(): void {
//     this.isLoading = true;
//     this.profileService.updateProfile(this.userProfile, this.selectedFile).subscribe({
//       next: (updatedProfile) => {
//         this.userProfile = updatedProfile;
//         this.isEditing = false;
//         this.selectedFile = null;
//         this.previewUrl = null;
//         this.showToast('Profile updated successfully!', 'success');
//         this.isLoading = false;
//       },
//       error: (error) => {
//         console.error('Error updating profile:', error);
//         this.showToast('Error updating profile. Please try again.', 'error');
//         this.isLoading = false;
//       }
//     });
//   }
//
//   removeAvatar(): void {
//     this.confirmationTitle = 'Confirm Deletion';
//     this.confirmationMessage = 'Are you sure you want to remove your profile picture? This action cannot be undone.';
//     this.onConfirmAction = this.proceedWithAvatarRemoval.bind(this);
//     this.showConfirmationPopup = true;
//   }
//
//   private proceedWithAvatarRemoval(): void {
//     this.isLoading = true;
//     this.profileService.deleteAvatar().subscribe({
//       next: () => {
//         this.userProfile.avatar = '';
//         this.previewUrl = null;
//         this.selectedFile = null;
//         this.showToast('Avatar removed successfully.', 'success');
//         this.isLoading = false;
//       },
//       error: (err) => {
//         console.error('Error removing avatar:', err);
//         this.showToast('Failed to remove avatar.', 'error');
//         this.isLoading = false;
//       }
//     });
//   }
//
//   onConfirm(): void {
//     if (this.onConfirmAction) { this.onConfirmAction(); }
//     this.closeConfirmationPopup();
//   }
//
//   closeConfirmationPopup(): void {
//     this.showConfirmationPopup = false;
//     this.onConfirmAction = null;
//   }
//
//   onNotificationChange(type: keyof typeof this.userProfile.notifications, event: any): void {
//     if (this.isEditing) { this.userProfile.notifications[type] = event.target.checked; }
//   }
//
//   getInitials(): string {
//     return this.userProfile.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '';
//   }
//
//   toggleNewPasswordVisibility(): void { this.newPasswordVisible = !this.newPasswordVisible; }
//   toggleConfirmPasswordVisibility(): void { this.confirmPasswordVisible = !this.confirmPasswordVisible; }
//
//   validatePassword(): void {
//     const pass = this.newPassword;
//     this.passwordValidations.length.valid = pass.length >= 8;
//     this.passwordValidations.uppercase.valid = /[A-Z]/.test(pass);
//     this.passwordValidations.lowercase.valid = /[a-z]/.test(pass);
//     this.passwordValidations.number.valid = /[0-9]/.test(pass);
//     this.passwordValidations.special.valid = /[!@#$%^&*]/.test(pass);
//   }
//
//   isPasswordValid(): boolean {
//     if (!this.currentPassword || this.newPassword !== this.confirmPassword) {
//       return false;
//     }
//     return Object.values(this.passwordValidations).every(rule => rule.valid);
//   }
// }




import { Component, OnInit, WritableSignal } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProfileService, UserProfile } from '../../services/profile.service';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, KeyValuePipe],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  // ✅ تم تحديث الكائن الأولي ليشمل الحقل الجديد
  userProfile: UserProfile = {
    id: 0,
    fullName: '',
    email: '',
    phoneNumber: '',
    department: '',
    position: '',
    avatar: '',
    createdAt: new Date(),
    nationalId: '',
    address: '',
    employeeCode: '', // تمت إضافته هنا
    notifications: { email: true, sms: true, marketing: false }
  };

  currentUser: WritableSignal<User | null>;

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  isEditing = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isLoading = false;
  toastMessage: string | null = null;
  toastType: 'success' | 'error' | null = null;
  showConfirmationPopup = false;
  confirmationTitle = '';
  confirmationMessage = '';
  private onConfirmAction: (() => void) | null = null;
  newPasswordVisible = false;
  confirmPasswordVisible = false;
  passwordValidations = {
    length: { text: 'At least 8 characters long', valid: false },
    uppercase: { text: 'Contains an uppercase letter', valid: false },
    lowercase: { text: 'Contains a lowercase letter', valid: false },
    number: { text: 'Contains a number', valid: false },
    special: { text: 'Contains a special character (!@#$%^&*)', valid: false }
  };
  currentPasswordVisible: boolean = false;

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => { this.toastMessage = null; this.toastType = null; }, 4000);
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.profileService.getUserProfile().subscribe({
      next: (profile) => { this.userProfile = profile; this.isLoading = false; },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.showToast('Failed to load profile data.', 'error');
        this.isLoading = false;
      }
    });
  }

  enableEditing(): void {
    this.isEditing = true;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.validatePassword();
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.selectedFile = null;
    this.previewUrl = null;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.loadUserProfile();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) { this.showToast('Please select an image file.', 'error'); return; }
      if (file.size > 2 * 1024 * 1024) { this.showToast('Image size should be less than 2MB.', 'error'); return; }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => { this.previewUrl = reader.result as string; };
      reader.readAsDataURL(file);
    }
  }

  toggleCurrentPasswordVisibility(): void {
    this.currentPasswordVisible = !this.currentPasswordVisible;
  }

  updatePassword(): void {
    if (!this.isPasswordValid()) {
      this.showToast('Please ensure the new password meets all criteria and matches the confirmation.', 'error');
      return;
    }

    this.isLoading = true;
    this.profileService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: (response) => {
        this.showToast(response.message, 'success');
        this.isLoading = false;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.validatePassword();
      },
      error: (error) => {
        console.error('Error changing password:', error);
        this.showToast(error.error?.message || 'Error changing password. Check current password.', 'error');
        this.isLoading = false;
      }
    });
  }

  saveProfile(): void {
    this.isLoading = true;
    this.profileService.updateProfile(this.userProfile, this.selectedFile).subscribe({
      next: (updatedProfile) => {
        this.userProfile = updatedProfile;
        this.isEditing = false;
        this.selectedFile = null;
        this.previewUrl = null;
        this.showToast('Profile updated successfully!', 'success');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.showToast('Error updating profile. Please try again.', 'error');
        this.isLoading = false;
      }
    });
  }

  removeAvatar(): void {
    this.confirmationTitle = 'Confirm Deletion';
    this.confirmationMessage = 'Are you sure you want to remove your profile picture? This action cannot be undone.';
    this.onConfirmAction = this.proceedWithAvatarRemoval.bind(this);
    this.showConfirmationPopup = true;
  }

  private proceedWithAvatarRemoval(): void {
    this.isLoading = true;
    this.profileService.deleteAvatar().subscribe({
      next: () => {
        this.userProfile.avatar = '';
        this.previewUrl = null;
        this.selectedFile = null;
        this.showToast('Avatar removed successfully.', 'success');
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error removing avatar:', err);
        this.showToast('Failed to remove avatar.', 'error');
        this.isLoading = false;
      }
    });
  }

  onConfirm(): void {
    if (this.onConfirmAction) { this.onConfirmAction(); }
    this.closeConfirmationPopup();
  }

  closeConfirmationPopup(): void {
    this.showConfirmationPopup = false;
    this.onConfirmAction = null;
  }

  onNotificationChange(type: keyof typeof this.userProfile.notifications, event: any): void {
    if (this.isEditing) { this.userProfile.notifications[type] = event.target.checked; }
  }

  getInitials(): string {
    return this.userProfile.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '';
  }

  toggleNewPasswordVisibility(): void { this.newPasswordVisible = !this.newPasswordVisible; }
  toggleConfirmPasswordVisibility(): void { this.confirmPasswordVisible = !this.confirmPasswordVisible; }

  validatePassword(): void {
    const pass = this.newPassword;
    this.passwordValidations.length.valid = pass.length >= 8;
    this.passwordValidations.uppercase.valid = /[A-Z]/.test(pass);
    this.passwordValidations.lowercase.valid = /[a-z]/.test(pass);
    this.passwordValidations.number.valid = /[0-9]/.test(pass);
    this.passwordValidations.special.valid = /[!@#$%^&*]/.test(pass);
  }

  isPasswordValid(): boolean {
    if (!this.currentPassword || this.newPassword !== this.confirmPassword) {
      return false;
    }
    return Object.values(this.passwordValidations).every(rule => rule.valid);
  }
}
