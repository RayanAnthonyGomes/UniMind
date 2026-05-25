// src/components/courses/AddCourseButton.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AddCourseModal from "./AddCourseModal";

interface Props {
  currentSemester: number;
  userId:          string;
  label?:          string;
}

export default function AddCourseButton({ currentSemester, userId, label }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        <Plus size={16} />
        {label ?? "Add Course"}
      </button>

      <AddCourseModal
        open={open}
        onClose={() => setOpen(false)}
        currentSemester={currentSemester}
        userId={userId}
      />
    </>
  );
}