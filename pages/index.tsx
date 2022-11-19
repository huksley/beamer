import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Dark } from "../components/Dark";
import { SiGithub, SiTwitter, SiLinkedin } from "react-icons/si";
import RootLayout from "../components/layout";

export const Page = () => {
  return (
    <RootLayout>
      <main>
        <Dark />

        <div className="sm:px-8 mt-9">
          <div className="mx-auto max-w-7xl lg:px-8">
            <div className="relative px-4 sm:px-8 lg:px-12">
              <div className="mx-auto max-w-2xl lg:max-w-5xl">
                <div className="max-w-2xl">
                  <div className="mb-8">
                    <Link aria-label="Home" className="block h-16 w-16 origin-left pointer-events-auto" href="/">
                      <Image
                        alt=""
                        src="/1.webp"
                        width={128}
                        height={128}
                        className="rounded-full bg-zinc-100 object-cover dark:bg-zinc-800 h-16 w-16"
                      />
                    </Link>
                  </div>

                  <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
                    Software designer, founder, and amateur astronaut.
                  </h1>
                  <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
                    I’m Spencer, a software designer and entrepreneur based in New York City. I’m the founder and CEO of
                    Planetaria, where we develop technologies that empower regular people to explore space on their own
                    terms.
                  </p>
                  <div className="mt-6 flex gap-2">
                    <a className="group m-1 p-1" aria-label="Follow on Twitter" href="https://twitter.com">
                      <SiTwitter />
                    </a>
                    <a className="group m-1 p-1" aria-label="Follow on GitHub" href="https://github.com">
                      <SiGithub />
                    </a>
                    <a className="group m-1 p-1" aria-label="Follow on LinkedIn" href="https://linkedin.com">
                      <SiLinkedin />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </RootLayout>
  );
};

export default Page;
