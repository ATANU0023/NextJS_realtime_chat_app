import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import {z} from 'zod';

export async function POST(req: Request){
    try {
        
        const body = await req.json();

        const {email: emailToAdd} = addFriendValidator.parse(body.email) 

        // Add friend logic here
        const RESTResponse = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/user:email${emailToAdd}`,{
            headers:{
                Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
            },
            cache: 'no-cache',
        })

        const data = await RESTResponse.json() as {result: string}

        const idToAdd = data.result;

        if(!idToAdd){
            return new Response('User not found', {status: 400})
        }

        const session = await getServerSession(authOptions);

        if(!session){
            return new Response('Unauthorized', {status: 401})
        }

        if(idToAdd === session.user.id){
            return new Response('You cannot add yourself as a friend', {status: 400})
        }

        // check if user is already added
        const isAlreadyAdded = (await fetchRedis(
            'sismember', 
            `usrer:${idToAdd}:incoming_friend_requests`,
            session.user.id)) as 0 | 1

        if(isAlreadyAdded){
            return new Response('User already added', {status: 400})
        }

        const isAlreadyFriends = (await fetchRedis(
            'sismember', 
            `usrer:${session.user.id}:friends`,
            idToAdd
            )) as 0 | 1

        if(isAlreadyFriends){
            return new Response(' Already friends with this user', {status: 400})
        }

        //valid request, send friend request
        db.sadd(`user:${idToAdd}:incomming_friend_requests`, session.user.id)

        return new Response('OK')

        console.log(data);
    } catch (error) {
        if(error instanceof z.ZodError){
            return new Response ('Invalid request payload',{status: 422})
        }

        return new Response('Invalid request',{status: 400})
    }
}