import Layout from "@/components/layout";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();

  return (
    <Layout>
      <div className="text-blue-900 flex justify-between">
        <h2>
          {" "}
          Hello , <b>{session?.user?.name}</b>
        </h2>
        <div className="flex bg-grey-300 gap-1 text-black">
          <img
            src={session?.user?.image}
            alt=""
            className="w-6 h-6 rounded-lg overflow-hidden"
          />
          <span className=" px-2">{session?.user?.name}</span>
        </div>
      </div>
    </Layout>
  );
}
