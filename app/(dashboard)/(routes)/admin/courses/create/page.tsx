import { db } from "@/lib/db";

import { CreateCourseWizard } from "./_components/create-course-wizard";

const CreatePage = async () => {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex min-h-full items-start justify-center px-4 py-8 sm:items-center sm:px-6 sm:py-12">
      <CreateCourseWizard categories={categories} />
    </div>
  );
};

export default CreatePage;
