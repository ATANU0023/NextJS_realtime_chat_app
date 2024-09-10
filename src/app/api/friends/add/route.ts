import { addFriendValidator } from "@/lib/validations/add-friend";

export async function POST(req: Request){
    try {
        
        const body = await req.json();

        const {email: emailToAdd} = addFriendValidator.parse(body.email) 

        // Add friend logic here
        const RESTResponse = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/user:email${emailToAdd}`)

    } catch (error) {
        
    }
}