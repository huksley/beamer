import {
  GetStaticPaths,
  GetStaticPathsContext,
  GetStaticProps,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from "next";
import Link from "next/link";
import { Layout } from "../../components/Layout";
import { JSONSafe, Posts, PostType } from "../../components/Posts";

// Generates `/posts/1` and `/posts/2`
export const getStaticPaths = async (context: GetStaticPathsContext) => {
  const ids = await Posts.getRecentPostIds();
  console.info("getStaticPaths", context, "ids", ids);
  console.info(
    "Result",
    ids.map((id) => ({ params: { id } }))
  );
  return {
    paths: ids.map((id) => ({ params: { id } })),
    fallback: "blocking", // can also be true or 'blocking'
  };
};

// `getStaticPaths` requires using `getStaticProps`
export const getStaticProps = async (
  context: GetStaticPropsContext<{ id?: string }>
): Promise<GetStaticPropsResult<{ post?: JSONSafe<PostType> }>> => {
  console.info("getStaticProps, context", context.params);
  if (!context.params?.id) {
    return { props: {} };
  }

  const post = await Posts.getPost(context.params?.id);
  if (!post) {
    return { props: {} };
  }

  return {
    // Passed to the page component as props
    props: {
      post: {
        ...post,
        added: post.added.toISOString(),
      },
    },
    revalidate: 10,
  };
};

export const Post = ({ post }: { post?: JSONSafe<PostType> }) => {
  if (!post) {
    return <Layout title="Not found">No post found</Layout>;
  }

  return (
    <Layout title={post.name} description={post.about}>
      <div className="my-6">
        <Link
          href="/posts/"
          className="inline-block rounded-md border border-transparent bg-indigo-600 py-3 px-8 text-center font-medium text-white hover:bg-indigo-700"
        >
          See all posts
        </Link>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Application</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Personal details and application. Added at {post.added}
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{post.name}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Application for</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{post.position}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{post.email}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Salary expectation</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{post.salary}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">About</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{post.about}</dd>
            </div>
          </dl>
        </div>
      </div>
    </Layout>
  );
};

export default Post;
