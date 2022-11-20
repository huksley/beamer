import { GetStaticPropsResult } from "next";
import Link from "next/link";
import { Layout } from "../../components/Layout";
import { PostList } from "../../components/PostList";
import { JSONSafe, Posts, PostType } from "../../components/Posts";

export const getStaticProps = async (): Promise<GetStaticPropsResult<{ posts?: JSONSafe<PostType>[] }>> => {
  const ids = await Posts.getAllPostIds();
  const posts = (await Promise.all(ids.map((id) => Posts.getPost(id)))).filter((p) => p !== undefined) as PostType[];
  return {
    // Passed to the page component as props
    props: {
      posts: posts.map((p) => ({ ...p, added: p.added.toISOString() })),
    },
    revalidate: 10,
  };
};

export const Page = ({ posts }: { posts?: JSONSafe<PostType>[] }) => {
  return (
    <Layout title="All posts" description={"Show all " + (posts ? posts.length : "?") + " posts"}>
      <div className="my-6">
        <Link
          href="/"
          className="inline-block rounded-md border border-transparent bg-indigo-600 py-3 px-8 text-center font-medium text-white hover:bg-indigo-700"
        >
          Recent posts
        </Link>
      </div>

      <div className="my-6">
        <PostList posts={posts} />
      </div>
    </Layout>
  );
};

export default Page;
