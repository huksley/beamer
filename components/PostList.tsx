import Link from "next/link";
import { GoFile } from "react-icons/go";
import { JSONSafe, PostType } from "./Posts";

export const PostList = ({ posts }: { posts?: JSONSafe<PostType>[] }) => (
  <ul>
    {posts?.map((p) => (
      <li key={p.id} className="mt-2 flex flex-row gap-2">
        <div className="flex flex-row p-1">
          <GoFile />
        </div>
        <div>
          <Link href={"/posts/" + p.id}>{p.name}</Link>
          <div>Published: {p.added}</div>
        </div>
      </li>
    ))}
  </ul>
);
