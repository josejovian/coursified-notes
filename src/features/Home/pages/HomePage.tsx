import React, { useMemo } from "react";
import clsx from "clsx";
import { CourseType } from "@/types";
import { useScreen } from "@/hooks";
import { CourseCard } from "../components";

export function HomePage() {
  const { width } = useScreen();

  const columns = useMemo(() => {
    if (width >= 1280) return 3;
    return 2;
  }, [width]);

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

    for (let i = 0; i < courses.length; i += columns) {
      result.push(courses.slice(i, i + columns));
    }

    return result;
  }, [columns, courses]);

  const renderGrid = useMemo(
    () => (
      <section>
        {distributedCourses.map((row, idx) => (
          <div
            key={`Course-${idx}`}
            className={clsx(
              "flex justify-center",
              idx !== distributedCourses.length - 1 && "mb-10"
            )}
            style={{
              gap: width > 720 ? "2rem" : "1rem",
            }}
          >
            {row.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                width={width > 720 ? 240 : 160}
              />
            ))}
          </div>
        ))}
      </section>
    ),
    [distributedCourses, width]
  );

  return (
    <main className="m-auto h-full flex items-center justify-center">
      {renderGrid}
    </main>
  );
}
