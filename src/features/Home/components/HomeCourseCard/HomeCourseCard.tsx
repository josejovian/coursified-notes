import Image from "next/image";
import Link from "next/link";
import { Paragraph } from "@/components";
import { CourseType } from "@/types";

interface CourseCardProps {
  course: CourseType;
  width?: number;
}

export function CourseCard({ course, width = 240 }: CourseCardProps) {
  const { id, title, thumbnail } = course;

  return (
    <Link href={`/${id}`} legacyBehavior>
      <a className="CourseCard_link focus:outline-0">
        <article className="CourseCard flex flex-col">
          {thumbnail && (
            <div
              className="bg-black border border-zinc-400 aspect-video overflow-hidden"
              style={{ width, aspectRatio: "16 / 9" }}
            >
              <Image
                className="transition-opacity"
                src={thumbnail}
                width={width}
                height={(width * 9) / 16}
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
