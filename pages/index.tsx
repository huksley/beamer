import Link from "next/link";
import { Layout } from "../components/Layout";
import { GetStaticPropsResult } from "next";
import { JSONSafe, Posts, PostType } from "../components/Posts";
import { PostList } from "../components/PostList";

export const getStaticProps = async (): Promise<GetStaticPropsResult<{ posts?: JSONSafe<PostType>[] }>> => {
  const ids = await Posts.getRecentPostIds();
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
    <Layout
      title="Recent posts"
      description={"All posts recently published." + (posts && posts?.length > 0 ? " Latest is " + posts[0].name : "")}
    >
      <div className="my-6">
        <Link
          href="/posts/"
          className="inline-block rounded-md border border-transparent bg-indigo-600 py-3 px-8 text-center font-medium text-white hover:bg-indigo-700"
        >
          See all posts
        </Link>
      </div>

      <div className="my-6">
        <PostList posts={posts} />
      </div>
    </Layout>
  );
};

export default Page;
