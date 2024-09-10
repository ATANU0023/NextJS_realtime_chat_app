import Button from "@/components/ui/Button";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { FC } from "react";


const Page = async({}) =>{

    const session = await getServerSession(authOptions);

    return <Button>hello</Button>
}

export default Page;