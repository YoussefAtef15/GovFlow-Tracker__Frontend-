import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagerDashboardDto } from '../../../services/manager.service';

@Component({
  selector: 'app-manager-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager-analytics.component.html',
  styleUrls: ['./manager-analytics.component.css']
})
export class ManagerAnalyticsComponent {
  @Input() dashboardStats: ManagerDashboardDto | null = null;

  get completionRate(): number {
    // ==========================================================
    // ✅ START: تم إضافة شرط للحماية من القسمة على صفر
    // This prevents a NaN error that was stopping the page from rendering subsequent components.
    // ==========================================================
    if (!this.dashboardStats || !this.dashboardStats.totalTasksInScope || this.dashboardStats.totalTasksInScope === 0) {
      return 0;
    }

    const rate = (this.dashboardStats.completedTasksInScope / this.dashboardStats.totalTasksInScope) * 100;
    return parseFloat(rate.toFixed(1));
  }
}
