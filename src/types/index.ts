export interface RoastResult {
  url: string;
  screenshotUrl: string;
  performanceScore: number;
  mobileFriendly: boolean;
  tafferGrade: 'F' | 'D' | 'C' | 'B' | 'A';
  theRoast: {
    headline: string;
    brutalSummary: string;
  };
  uxFailures: Array<{ issue: string; fix: string }>;
  speedFailures: Array<{ issue: string; fix: string }>;
  copyFailures: Array<{ issue: string; fix: string }>;
  theBottomLine: string;
}
