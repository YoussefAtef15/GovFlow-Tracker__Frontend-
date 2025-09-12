import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core'; // <<< تم حذف AfterViewInit, OnDestroy
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ManagerService, ReportStats, PerformanceMetric, TopPerformer, ScopedReportData, ReportStatValue } from '../../../services/manager.service';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { LegendPosition } from '@swimlane/ngx-charts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgxChartsModule],
  templateUrl: './reports-dashboard.component.html',
  styleUrls: ['./reports-dashboard.component.css']
})
export class ReportsDashboardComponent implements OnInit { // <<< تم حذف AfterViewInit, OnDestroy
  // Element references for animated counters
  @ViewChild('totalRequestsValue') totalRequestsEl!: ElementRef;
  @ViewChild('approvedValue') approvedEl!: ElementRef;
  @ViewChild('rejectedValue') rejectedEl!: ElementRef;
  @ViewChild('avgTimeValue') avgTimeEl!: ElementRef;

  stats: ReportStats | null = null;
  performanceMetrics: PerformanceMetric[] = [];
  topPerformers: TopPerformer[] = [];
  totalMetrics: any = null;
  selectedPeriod: string = 'Last 30 Days';
  periods = ['Last 30 Days', 'Last 90 Days', 'This Year'];
  math = Math;

  // --- UI Control Flags ---
  isLoading = true;
  errorMessage: string | null = null;
  showExportModal = false;
  isDownloading = false;
  currentDate = new Date();
  managerScope: string = 'Overall performance metrics';

  // --- Chart data properties ---
  requestsByDepartmentData: any[] = [];
  approvalRateTrendData: any[] = [];

  // --- Chart configuration options ---
  view: [number, number] = [0, 350];
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = true;
  legendPosition: LegendPosition = LegendPosition.Right;
  colorSchemeDonut: Color = {
    name: 'govFlowVibrant',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#3A4A7B', '#FF5722', '#28a745', '#f59e0b', '#6B7B9B', '#3b82f6', '#ef4444']
  };
  showXAxis = true;
  showYAxis = true;
  showXAxisLabel = true;
  xAxisLabel = 'Month';
  showYAxisLabel = true;
  yAxisLabel = 'Approval Rate (%)';
  timeline = true;
  autoScale = true;
  colorSchemeLine: Color = {
    name: 'govFlowLine',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#3A4A7B']
  };

  private managerService = inject(ManagerService);
  // <<< تم حذف observer لأنه لم يعد مستخدمًا

  ngOnInit(): void {
    this.loadReportData();
  }

  // <<< تم حذف ngAfterViewInit و ngOnDestroy بالكامل

  loadReportData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    // The 'getReportData' method now needs the 'selectedPeriod'
    this.managerService.getReportData(this.selectedPeriod).subscribe({
      next: (data: ScopedReportData) => {
        this.stats = data.report.stats;
        this.performanceMetrics = data.report.performanceMetrics;
        this.topPerformers = data.report.topPerformers ?? [];
        this.managerScope = data.managerScope;

        // <<< ✍️ START: التعديل الرئيسي لتشغيل الأنيميشن بشكل مضمون
        // نستخدم setTimeout لدفع تشغيل الأنيميشن للدورة التالية من اكتشاف التغييرات في Angular
        // هذا يضمن أن الـ HTML قد تم تحديثه بالقيم الجديدة قبل أن نبدأ الأنيميشن
        setTimeout(() => this.startCountersAnimation(), 0);
        // <<< ✍️ END: نهاية التعديل الرئيسي

        this.requestsByDepartmentData = this.performanceMetrics.map(metric => ({
          name: metric.department,
          value: metric.totalRequests
        }));

        this.approvalRateTrendData = [{
          name: 'Approval Rate',
          series: [
            { name: 'Jan', value: 85 }, { name: 'Feb', value: 88 },
            { name: 'Mar', value: 82 }, { name: 'Apr', value: 86 },
            { name: 'May', value: 90 }, { name: 'Jun', value: 92 }
          ]
        }];

        this.calculateTotals();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load report data', err);
        this.errorMessage = "Could not load report data. Please try again later.";
        this.isLoading = false;
      }
    });
  }

  startCountersAnimation(): void {
    if (!this.stats) return;
    this.animateValue(this.totalRequestsEl, parseFloat(this.stats.totalRequests.value), 1500);
    this.animateValue(this.approvedEl, parseFloat(this.stats.approved.value), 1500);
    this.animateValue(this.rejectedEl, parseFloat(this.stats.rejected.value), 1500);
    this.animateValue(this.avgTimeEl, parseFloat(this.stats.avgProcessingTime.value), 1500);
  }

  animateValue(elementRef: ElementRef, endValue: number, duration: number): void {
    // <<< ✍️ START: تحسين دالة الأنيميشن للتعامل مع القيم غير الرقمية والأرقام العشرية
    if (!elementRef || isNaN(endValue)) {
      if (elementRef) {
        // إذا كانت القيمة غير صالحة، اعرضها كما هي أو اعرض صفرًا
        elementRef.nativeElement.textContent = isNaN(endValue) ? '0' : endValue.toLocaleString();
      }
      return;
    }
    // <<< ✍️ END: تحسين دالة الأنيميشن

    const startValue = 0;
    const startTime = performance.now();
    const frame = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const currentValue = this.easeOutCubic(progress) * (endValue - startValue) + startValue;

      // <<< ✍️ START: تعديل بسيط لعرض الأرقام العشرية بشكل صحيح لمتوسط الوقت
      if (elementRef === this.avgTimeEl) {
        // عرض رقم عشري واحد لمتوسط الوقت
        elementRef.nativeElement.textContent = currentValue.toFixed(1);
      } else {
        // عرض أرقام صحيحة للباقي
        elementRef.nativeElement.textContent = Math.floor(currentValue).toLocaleString();
      }
      // <<< ✍️ END: تعديل بسيط

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        if (elementRef === this.avgTimeEl) {
          elementRef.nativeElement.textContent = endValue.toFixed(1);
        } else {
          elementRef.nativeElement.textContent = endValue.toLocaleString();
        }
      }
    };
    requestAnimationFrame(frame);
  }

  easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  calculateTotals(): void {
    if (!this.performanceMetrics || this.performanceMetrics.length === 0) return;
    const totalRequests = this.performanceMetrics.reduce((sum, item) => sum + item.totalRequests, 0);
    const approved = this.performanceMetrics.reduce((sum, item) => sum + item.approved, 0);
    const rejected = this.performanceMetrics.reduce((sum, item) => sum + item.rejected, 0);
    const avgTime = this.performanceMetrics.reduce((sum, item) => sum + item.avgTime, 0) / this.performanceMetrics.length;
    const slaCompliance = this.performanceMetrics.reduce((sum, item) => sum + (parseFloat(item.slaCompliance) || 0), 0) / this.performanceMetrics.length;

    this.totalMetrics = {
      department: 'Total',
      totalRequests,
      approved,
      rejected,
      approvalRate: totalRequests > 0 ? ((approved / totalRequests) * 100).toFixed(1) : '0.0',
      avgTime: avgTime.toFixed(1),
      slaCompliance: slaCompliance.toFixed(0)
    };
  }

  getStatChangeClass(change?: number): string {
    if (change === undefined) return '';
    // <<< ✍️ START: تحسين لعكس الألوان لمتوسط الوقت (السالب يعني تحسن)
    // For processing time, a negative change is good (positive color), a positive change is bad (negative color)
    if (this.stats && this.stats.avgProcessingTime.change === change) {
      return change > 0 ? 'stat-change-negative' : 'stat-change-positive';
    }
    // <<< ✍️ END: تحسين
    return change >= 0 ? 'stat-change-positive' : 'stat-change-negative';
  }

  pieChartLabelFormatting(data: any): string {
    const label = data.label || 'N/A';
    if (this.totalMetrics && this.totalMetrics.totalRequests > 0 && data.value) {
      const percentage = ((data.value / this.totalMetrics.totalRequests) * 100).toFixed(1);
      return `${percentage}%`;
    }
    return String(label);
  }

  downloadPdf(): void {
    const data = document.getElementById('pdf-content');
    if (data) {
      this.isDownloading = true;
      html2canvas(data, { scale: 2, useCORS: true }).then(canvas => {
        const imgWidth = 208;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(contentDataURL, 'PNG', 1, 1, imgWidth, imgHeight);
        pdf.save(`GovFlow_Report_${this.currentDate.toISOString().split('T')[0]}.pdf`);
        this.isDownloading = false;
        this.showExportModal = false;
      }).catch(() => {
        this.isDownloading = false;
      });
    }
  }
}
