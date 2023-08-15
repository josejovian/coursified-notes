import { CourseType } from "@/src/type";
import Image from "next/image";
import { Paragraph } from "../../Basic";
import Link from "next/link";

interface CourseCardProps {
  course: CourseType;
}

export function CourseCard({ course }: CourseCardProps) {
  const { id, title, thumbnail } = course;

  return (
    <Link href={`/course/${id}`} legacyBehavior>
      <a className="CourseCard_link focus:outline-0">
        <article className="CourseCard flex flex-col w-60">
          {thumbnail && (
            <div
              className="bg-black border border-zinc-400 overflow-hidden"
              style={{ height: "135px" }}
            >
              <Image
                className="transition-opacity"
                src={thumbnail}
                width={240}
                height={135}
                alt="Course Thumbnail"
              />
            </div>
          )}
          <Paragraph className="mt-4" size="l-alt" weight="bold">
            {title}
          </Paragraph>
          <Paragraph className="mt-2" size="m-alt">
            Jose Jovian
          </Paragraph>
        </article>
      </a>
    </Link>
  );
}
