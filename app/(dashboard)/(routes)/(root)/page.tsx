import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation";
import { BookOpen, CheckCircle2, Clock, Flame } from "lucide-react";

import { getDashboard } from "@/actions/get-dashboard-courses";
import { getActiveSubscription } from "@/lib/access";
import { PASS } from "@/lib/plans";
import { PassCard } from "./_components/pass-card";

import { Greeting } from "./_components/greeting";
import { StatCard } from "./_components/stat-card";
import { ContinueLearning } from "./_components/continue-learning";
import { ActivityChart } from "./_components/activity-chart";
import { ProgressOverview } from "./_components/progress-overview";
import { MyCourses } from "./_components/my-courses";
import { DashboardEmpty } from "./_components/dashboard-empty";

export default async function Dashboard() {
  const { userId } = auth();

  if(!userId) {
    return redirect("/sign-in");
  }

  const [{ courses, continueCourse, stats, activity, recommended }, subscription] = await Promise.all([
    getDashboard(userId),
    getActiveSubscription(userId),
  ]);
  const hasCourses = courses.length > 0;

  const subtitle = !hasCourses
    ? "Find a course and start learning today."
    : continueCourse
      ? "Pick up where you left off."
      : "You've completed all your courses. Time for something new?";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <Greeting subtitle={subtitle} />

      <PassCard
        name={PASS.name}
        monthlyPrice={PASS.monthlyPrice}
        trialDays={PASS.trialDays}
        subscription={
          subscription
            ? { ...subscription, currentPeriodEnd: subscription.currentPeriodEnd.toISOString() }
            : null
        }
      />

      {!hasCourses ? (
        <DashboardEmpty recommended={recommended} />
      ) : (
        <>
          {/* KPIs: 2 per row on phones, 4 on large screens */}
          <section aria-label="Your stats" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard
              label="Enrolled"
              value={stats.enrolled}
              icon={BookOpen}
              hint={`${stats.chaptersTotal} chapters in total`}
            />
            <StatCard
              label="In progress"
              value={stats.inProgress}
              icon={Clock}
              tone="amber"
              hint={stats.inProgress ? "Keep going!" : "Nothing pending"}
            />
            <StatCard
              label="Completed"
              value={stats.completed}
              icon={CheckCircle2}
              tone="emerald"
              hint={`${stats.chaptersCompleted} chapters finished`}
            />
            <StatCard
              label="Day streak"
              value={activity.streak}
              icon={Flame}
              tone="violet"
              hint={activity.streak ? "Don't break the chain" : "Complete a chapter today"}
            />
          </section>

          {continueCourse && <ContinueLearning course={continueCourse} />}

          {/* Activity (2/3) + overall progress (1/3) on large screens; stacked on mobile */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ActivityChart days={activity.days} thisWeek={activity.thisWeek} streak={activity.streak} />
            </div>
            <ProgressOverview
              chaptersCompleted={stats.chaptersCompleted}
              chaptersTotal={stats.chaptersTotal}
              inProgress={stats.inProgress}
              completed={stats.completed}
            />
          </div>

          <MyCourses courses={courses} />
        </>
      )}
    </div>
  )
}
