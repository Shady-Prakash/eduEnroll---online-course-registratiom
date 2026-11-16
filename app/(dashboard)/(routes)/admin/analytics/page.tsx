import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";

import { getAnalytics } from "@/actions/get-analytics";
import { formatPrice } from "@/lib/format";
import { isTeacher } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import DataCard from "./_components/data-card";
import { LazyChart } from "./_components/chart-lazy";
import { TopCourses } from "./_components/top-courses";
import { CoursePerformance } from "./_components/course-performance";
import { Heading } from "@/components/ui/typography";

const monthChange = (current: number, previous: number) => {
  if (!previous) {
    return current
      ? { hint: `${formatPrice(current)} this month`, tone: "positive" as const }
      : { hint: "No sales this month", tone: "neutral" as const };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  return {
    hint: `${pct >= 0 ? "+" : ""}${pct}% vs last month`,
    tone: pct >= 0 ? ("positive" as const) : ("negative" as const),
  };
};

const AnalyticsPage = async () => {
  const { userId, orgRole } = auth();

  if (!userId || !isTeacher(orgRole)) {
    return redirect("/");
  }

  const { totals, monthly, courses } = await getAnalytics(userId);
  const hasSales = totals.sales > 0;
  const trend = monthChange(totals.revenueThisMonth, totals.revenueLastMonth);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-y-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Heading>Analytics</Heading>
          <p className="text-sm text-ink-500">
            Sales and learner progress across your courses.
          </p>
        </div>
        <p className="text-xs text-ink-400">
          Revenue from one-time purchases. eduEnroll Pass enrolments count as students.
        </p>
      </div>

      {/* KPIs: 2 columns on mobile, 4 on large screens */}
      <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <DataCard
          label="Total revenue"
          value={formatPrice(totals.revenue)}
          icon={DollarSign}
          hint={trend.hint}
          hintTone={trend.tone}
        />
        <DataCard
          label="Total sales"
          value={totals.sales.toLocaleString("en-US")}
          icon={ShoppingCart}
          hint="All-time enrolments"
        />
        <DataCard
          label="Students"
          value={totals.students.toLocaleString("en-US")}
          icon={Users}
          hint="Unique buyers"
        />
        <DataCard
          label="Published courses"
          value={`${totals.publishedCourses}/${totals.totalCourses}`}
          icon={BookOpen}
          hint={
            totals.totalCourses - totals.publishedCourses
              ? `${totals.totalCourses - totals.publishedCourses} in draft`
              : "All courses live"
          }
        />
      </section>

      {!hasSales && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-x-3">
              <div className="rounded-full bg-brand-100 p-2">
                <TrendingUp className="h-5 w-5 text-brand-700" aria-hidden />
              </div>
              <div>
                <p className="font-medium text-ink-900">No sales yet</p>
                <p className="text-sm text-ink-500">
                  Publish a course with at least one chapter. Your sales and revenue will show up here.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link href="/admin/courses">Manage courses</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Charts: stacked on mobile, 2/3 + 1/3 on large screens */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-base">Last 6 months</CardTitle>
            <CardDescription>Monthly revenue and sales</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 sm:p-6 sm:pt-2">
            <LazyChart data={monthly} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-base">Top courses</CardTitle>
            <CardDescription>By revenue</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 sm:p-6 sm:pt-2">
            <TopCourses courses={courses} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
          <CardTitle className="text-base">Course performance</CardTitle>
          <CardDescription>
            Completion = chapters finished by buyers, out of all published chapters.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 sm:p-6 sm:pt-4">
          <CoursePerformance courses={courses} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
