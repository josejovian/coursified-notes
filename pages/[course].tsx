import { readAllCourses, getDetailedCourse } from "@/lib/mdx";
import { CourseDetailPage } from "@/features/Course/pages/CourseDetailPage";

interface CourseProps {
  details: string;
}
const CourseDetail = (props: CourseProps) => <CourseDetailPage {...props} />;

export const getStaticPaths = async () => {
  const courses: string[] = await readAllCourses();

  return {
    paths: courses.map((course) => ({
      params: {
        course: course.replace(".mdx", ""),
      },
    })),
    fallback: false,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getStaticProps = async (req: any) => {
  const { course } = req.params;

  const details = await getDetailedCourse(course);

  return {
    props: { details: JSON.stringify(details) },
  };
};

export default CourseDetail;
