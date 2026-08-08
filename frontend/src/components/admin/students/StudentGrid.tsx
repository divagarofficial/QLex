"use client";

import StudentCard from "./StudentCard";
import { StudentItem } from "@/services/adminStudents";

interface StudentGridProps {
  students: StudentItem[];
  onToggleStatusClick: (student: StudentItem) => void;
}

export default function StudentGrid({ students, onToggleStatusClick }: StudentGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
      {students.map((student) => (
        <StudentCard
          key={student.id}
          student={student}
          onToggleStatusClick={onToggleStatusClick}
        />
      ))}
    </div>
  );
}
