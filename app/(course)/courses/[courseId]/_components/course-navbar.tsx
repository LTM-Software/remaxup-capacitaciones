import { Course } from "@prisma/client";

import { NavbarRoutes } from "@/components/navbar-routes";
import { CurriculumItem } from "@/actions/get-course-curriculum";

import { CourseMobileSidebar } from "./course-mobile-sidebar";

interface CourseNavbarProps {
  course: Course;
  items: CurriculumItem[];
  progressCount: number;
  hasPurchase: boolean;
}

export const CourseNavbar = ({
  course,
  items,
  progressCount,
  hasPurchase,
}: CourseNavbarProps) => {
  return (
    <div className="p-4 border-b h-full flex items-center bg-white shadow-sm">
      <CourseMobileSidebar
        course={course}
        items={items}
        progressCount={progressCount}
        hasPurchase={hasPurchase}
      />
      <NavbarRoutes />
    </div>
  );
};
