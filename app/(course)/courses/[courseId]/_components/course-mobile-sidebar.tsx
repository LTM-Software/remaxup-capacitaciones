import { Menu } from "lucide-react";
import { Course } from "@prisma/client";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarGroup } from "@/actions/get-course-curriculum";

import { CourseSidebar } from "./course-sidebar";

interface CourseMobileSidebarProps {
  course: Course;
  groups: SidebarGroup[];
  progressCount: number;
  hasPurchase: boolean;
}

export const CourseMobileSidebar = ({
  course,
  groups,
  progressCount,
  hasPurchase,
}: CourseMobileSidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-white w-72">
        <CourseSidebar
          course={course}
          groups={groups}
          progressCount={progressCount}
          hasPurchase={hasPurchase}
        />
      </SheetContent>
    </Sheet>
  );
};
