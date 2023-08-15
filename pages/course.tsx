import React, { useMemo } from "react";
import clsx from "clsx";
import { CourseCard } from "@/src/components";
import { CourseType } from "@/src/type";

export default function CourseMaterial() {
  const courses = useMemo<CourseType[]>(
    () => [
      {
        id: "calculus",
        title: "Calculus",
        description: "",
        thumbnail: "/calculus.jpg",
        sections: [],
      },
      {
        id: "calculus-2",
        title: "Calculus II",
        description: "",
        thumbnail: "/calculus-2.jpg",
        sections: [],
      },
      {
        id: "linear-algebra",
        title: "Linear Algebra",
        description: "",
        thumbnail: "/linear-algebra.jpg",
        sections: [],
      },
      {
        id: "math",
        title: "Matematika SMA",
        description: "",
        thumbnail: "/math.jpg",
        sections: [],
      },
      {
        id: "physics",
        title: "Fisika SMA",
        description: "",
        thumbnail: "/physics.jpg",
        sections: [],
      },
    ],
    []
  );

  const distributedCourses = useMemo<CourseType[][]>(() => {
    const result = [];

    for (let i = 0; i < courses.length; i += 3) {
      result.push(courses.slice(i, i + 3));
    }

    return result;
  }, [courses]);

  const renderGrid = useMemo(
    () => (
      <section>
        {distributedCourses.map((row, idx) => (
          <div
            key={`Course-${idx}`}
            className={clsx(
              "flex justify-center gap-10",
              idx !== distributedCourses.length - 1 && "mb-10"
            )}
          >
            {row.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ))}
      </section>
    ),
    [distributedCourses]
  );

  return (
    <main
      className="m-auto h-full flex items-center justify-center"
      style={{ width: "1024px" }}
    >
      {renderGrid}
    </main>
  );
}
